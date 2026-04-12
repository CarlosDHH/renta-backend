import prisma from '../config/prisma.js'
import { generateResponse } from '../utils/handleResponse.js'
import { paginate, paginatedResponse } from '../utils/queryHelpers.js'

const baseWhere = { deleted: false }

export const getAll = async ({ page, limit, contractId, customerId, paymentType } = {}) => {
  try {
    const where = {
      ...baseWhere,
      ...(contractId && { contractId }),
      ...(paymentType && { paymentType }),
      ...(customerId && {
        contract: { customerId },
      }),
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { paidAt: 'desc' },
        include: {
          contract: {
            include: {
              customer: { select: { id: true, name: true, lastName: true } },
              plan: { select: { id: true, name: true, price: true } },
            },
          },
          user: { select: { id: true, name: true, lastName: true } },
          receipt: { select: { id: true, folio: true, sendStatus: true } },
        },
      }),
      prisma.payment.count({ where }),
    ])

    return generateResponse(200, true, 'Pagos obtenidos', paginatedResponse(payments, total, page, limit))
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener pagos', null, error.message)
  }
}

export const getById = async (id) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id, ...baseWhere },
      include: {
        contract: {
          include: {
            customer: true,
            plan: true,
          },
        },
        user: { select: { id: true, name: true, lastName: true } },
        receipt: true,
      },
    })

    if (!payment) return generateResponse(404, false, 'Pago no encontrado')

    return generateResponse(200, true, 'Pago obtenido', payment)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener pago', null, error.message)
  }
}

export const create = async (data, userId) => {
  try {
    // Verificar que el contrato existe y está activo
    const contract = await prisma.contract.findFirst({
      where: { id: data.contractId, status: 'ACTIVE', deleted: false },
      include: { customer: true, plan: true },
    })
    if (!contract) return generateResponse(404, false, 'Contrato no encontrado o inactivo')

    // Generar folio único
    const count = await prisma.receipt.count()
    const year = new Date().getFullYear()
    const folio = `RNT-${year}-${String(count + 1).padStart(6, '0')}`

    // Crear pago y comprobante en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          contractId: data.contractId,
          userId,
          amount: data.amount,
          paymentType: data.paymentType ?? 'FULL',
          balance: data.balance ?? null,
          periodFrom: new Date(data.periodFrom),
          periodTo: new Date(data.periodTo),
          paymentMethod: data.paymentMethod ?? 'CASH',
          notes: data.notes ?? null,
        },
        include: {
          contract: {
            include: {
              customer: { select: { id: true, name: true, lastName: true } },
              plan: { select: { id: true, name: true, price: true } },
            },
          },
          user: { select: { id: true, name: true, lastName: true } },
        },
      })

      // Crear comprobante automáticamente
      const receipt = await tx.receipt.create({
        data: {
          paymentId: payment.id,
          folio,
          recipientPhone: contract.customer.phone,
        },
      })

      // Si el pago es completo, actualizar lastPaidPeriod en el cliente
      if (data.paymentType === 'FULL' || !data.paymentType) {
        await tx.customer.update({
          where: { id: contract.customerId },
          data: { lastPaidPeriod: new Date(data.periodTo) },
        })
      }

      return { ...payment, receipt }
    })

    return generateResponse(201, true, 'Pago registrado', result)
  } catch (error) {
    return generateResponse(500, false, 'Error al registrar pago', null, error.message)
  }
}

export const remove = async (id) => {
  try {
    const payment = await prisma.payment.findFirst({ where: { id, ...baseWhere } })
    if (!payment) return generateResponse(404, false, 'Pago no encontrado')

    await prisma.payment.update({
      where: { id },
      data: { deleted: true },
    })

    return generateResponse(200, true, 'Pago eliminado')
  } catch (error) {
    return generateResponse(500, false, 'Error al eliminar pago', null, error.message)
  }
}