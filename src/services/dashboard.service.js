import { DateTime } from 'luxon'
import prisma from '../config/prisma.js'
import { generateResponse } from '../utils/handleResponse.js'

const TIMEZONE = 'America/Mexico_City'

const MONTH_LABELS = {
  1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic',
}

const METHOD_LABELS = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
}

export const getSummary = async ({ months = 6 } = {}) => {
  try {
    const validMonths = [3, 6, 12].includes(Number(months)) ? Number(months) : 6
    const now = DateTime.now().setZone(TIMEZONE)

    const startOfCurrentMonth = now.startOf('month').toJSDate()
    const endOfCurrentMonth   = now.endOf('month').toJSDate()
    const startOfPrevMonth    = now.minus({ months: 1 }).startOf('month').toJSDate()
    const endOfPrevMonth      = now.minus({ months: 1 }).endOf('month').toJSDate()
    const startOfRange        = now.minus({ months: validMonths - 1 }).startOf('month').toJSDate()

    const [
      activeCustomers,
      activeContracts,
      newCustomersThisMonth,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      totalPaymentsThisMonth,
      pendingReceiptsCount,
      activeContractCustomers,
      paymentsInRange,
      contractsByPlan,
      plans,
      paymentMethodAgg,
      recentPaymentsRaw,
      overdueContractsRaw,
    ] = await Promise.all([
      prisma.customer.count({
        where: { active: true, deleted: false, contracts: { some: { status: 'ACTIVE', deleted: false } } },
      }),
      prisma.contract.count({ where: { status: 'ACTIVE', deleted: false } }),
      prisma.customer.count({ where: { deleted: false, createdAt: { gte: startOfCurrentMonth } } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { deleted: false, paidAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { deleted: false, paidAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
      }),
      prisma.payment.count({
        where: { deleted: false, paidAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } },
      }),
      prisma.receipt.count({ where: { deleted: false, sendStatus: 'PENDING' } }),
      prisma.contract.findMany({
        where: { status: 'ACTIVE', deleted: false },
        select: { customer: { select: { id: true, lastPaidPeriod: true } } },
      }),
      prisma.payment.findMany({
        where: { deleted: false, paidAt: { gte: startOfRange, lte: endOfCurrentMonth } },
        select: { paidAt: true, amount: true },
      }),
      prisma.contract.groupBy({
        by: ['planId'],
        where: { status: 'ACTIVE', deleted: false },
        _count: { id: true },
      }),
      prisma.plan.findMany({
        where: { deleted: false },
        select: { id: true, name: true, price: true },
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { deleted: false, paidAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { deleted: false },
        orderBy: { paidAt: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          paymentType: true,
          paymentMethod: true,
          paidAt: true,
          contract: {
            select: {
              customer: { select: { name: true, lastName: true } },
              plan: { select: { name: true } },
            },
          },
          receipt: { select: { folio: true } },
        },
      }),
      prisma.contract.findMany({
        where: {
          status: 'ACTIVE',
          deleted: false,
          customer: {
            deleted: false,
            OR: [{ lastPaidPeriod: null }, { lastPaidPeriod: { lt: startOfCurrentMonth } }],
          },
        },
        select: {
          startDate: true,
          customer: { select: { id: true, name: true, lastName: true, phone: true, lastPaidPeriod: true } },
          plan: { select: { name: true, price: true } },
        },
      }),
    ])

    // ─── kpis ─────────────────────────────────────────────────────────────────
    const revenueThisMonth = Number(revenueThisMonthAgg._sum.amount ?? 0)
    const revenueLastMonth = Number(revenueLastMonthAgg._sum.amount ?? 0)
    const revenueVariationPercent =
      revenueLastMonth === 0
        ? 0
        : Number((((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(2))

    const kpis = {
      activeCustomers,
      activeContracts,
      newCustomersThisMonth,
      revenueThisMonth,
      revenueLastMonth,
      revenueVariationPercent,
      totalPaymentsThisMonth,
      pendingReceiptsCount,
    }

    // ─── paymentStatus ────────────────────────────────────────────────────────
    const startOfCurrentMonthDt = now.startOf('month')
    const startOfPrevMonthDt    = now.minus({ months: 1 }).startOf('month')
    const dayOfMonth            = now.day

    let upToDate = 0, grace = 0, late = 0, overdue = 0
    const seen = new Set()

    for (const { customer } of activeContractCustomers) {
      if (seen.has(customer.id)) continue
      seen.add(customer.id)

      if (!customer.lastPaidPeriod) {
        overdue++
      } else {
        const lpp = DateTime.fromJSDate(customer.lastPaidPeriod).setZone(TIMEZONE)
        if (lpp >= startOfCurrentMonthDt) {
          upToDate++
        } else if (lpp >= startOfPrevMonthDt) {
          if (dayOfMonth <= 5) grace++
          else late++
        } else {
          overdue++
        }
      }
    }

    const paymentStatus = { upToDate, grace, late, overdue }

    // ─── revenueByMonth ───────────────────────────────────────────────────────
    const monthMap = new Map()
    for (const { paidAt, amount } of paymentsInRange) {
      const key = DateTime.fromJSDate(paidAt).setZone(TIMEZONE).toFormat('yyyy-MM')
      if (!monthMap.has(key)) monthMap.set(key, { total: 0, count: 0 })
      const e = monthMap.get(key)
      e.total += Number(amount)
      e.count++
    }

    const revenueByMonth = []
    for (let i = validMonths - 1; i >= 0; i--) {
      const dt  = now.minus({ months: i })
      const key = dt.toFormat('yyyy-MM')
      const e   = monthMap.get(key) ?? { total: 0, count: 0 }
      revenueByMonth.push({
        month: key,
        label: `${MONTH_LABELS[dt.month]} ${dt.year}`,
        total: Number(e.total.toFixed(2)),
        paymentsCount: e.count,
      })
    }

    // ─── planDistribution ────────────────────────────────────────────────────
    const planMap = new Map(plans.map(p => [p.id, p]))
    const planDistribution = contractsByPlan
      .map(({ planId, _count }) => {
        const plan = planMap.get(planId)
        if (!plan) return null
        return { planId, planName: plan.name, price: Number(plan.price), activeContracts: _count.id }
      })
      .filter(Boolean)
      .sort((a, b) => b.activeContracts - a.activeContracts)

    // ─── paymentMethodBreakdown ───────────────────────────────────────────────
    const paymentMethodBreakdown = paymentMethodAgg.map(({ paymentMethod, _count, _sum }) => ({
      method: paymentMethod,
      label: METHOD_LABELS[paymentMethod] ?? paymentMethod,
      count: _count.id,
      total: Number(Number(_sum.amount ?? 0).toFixed(2)),
    }))

    // ─── recentPayments ───────────────────────────────────────────────────────
    const recentPayments = recentPaymentsRaw.map(p => ({
      id: p.id,
      folio: p.receipt?.folio ?? null,
      customerName: `${p.contract.customer.name} ${p.contract.customer.lastName}`,
      planName: p.contract.plan.name,
      amount: Number(p.amount),
      paymentType: p.paymentType,
      paymentMethod: p.paymentMethod,
      paidAt: p.paidAt,
    }))

    // ─── overdueCustomers ─────────────────────────────────────────────────────
    const overdueCustomers = overdueContractsRaw
      .map(({ startDate, customer, plan }) => {
        // reference = lastPaidPeriod if exists, else the month before contract started
        const reference = customer.lastPaidPeriod
          ? DateTime.fromJSDate(customer.lastPaidPeriod).setZone(TIMEZONE)
          : DateTime.fromJSDate(startDate).setZone(TIMEZONE).minus({ months: 1 })

        const monthsOverdue = Math.max(
          1,
          (now.year - reference.year) * 12 + (now.month - reference.month)
        )
        const planPrice = Number(plan.price)

        return {
          customerId: customer.id,
          customerName: `${customer.name} ${customer.lastName}`,
          phone: customer.phone,
          planName: plan.name,
          planPrice,
          lastPaidPeriod: customer.lastPaidPeriod,
          monthsOverdue,
          estimatedDebt: Number((monthsOverdue * planPrice).toFixed(2)),
        }
      })
      .sort((a, b) => b.monthsOverdue - a.monthsOverdue || b.estimatedDebt - a.estimatedDebt)
      .slice(0, 10)

    return generateResponse(200, true, 'Dashboard obtenido', {
      kpis,
      paymentStatus,
      revenueByMonth,
      planDistribution,
      paymentMethodBreakdown,
      recentPayments,
      overdueCustomers,
    })
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener dashboard', null, error.message)
  }
}
