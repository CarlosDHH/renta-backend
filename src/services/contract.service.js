import prisma from '../config/prisma.js'
import { generateResponse } from '../utils/handleResponse.js'
import { paginate, paginatedResponse } from '../utils/queryHelpers.js'

const baseWhere = { deleted: false }

export const getAll = async ({ page, limit, status, customerId } = {}) => {
  try {
    const where = {
      ...baseWhere,
      ...(status && { status }),
      ...(customerId && { customerId }),
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, lastName: true, phone: true },
          },
          plan: {
            select: { id: true, name: true, mbps: true, price: true },
          },
        },
      }),
      prisma.contract.count({ where }),
    ])

    return generateResponse(200, true, 'Contratos obtenidos', paginatedResponse(contracts, total, page, limit))
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener contratos', null, error.message)
  }
}

export const getById = async (id) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id, ...baseWhere },
      include: {
        customer: true,
        plan: true,
        payments: {
          where: { deleted: false },
          orderBy: { paidAt: 'desc' },
        },
      },
    })

    if (!contract) return generateResponse(404, false, 'Contrato no encontrado')

    return generateResponse(200, true, 'Contrato obtenido', contract)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener contrato', null, error.message)
  }
}

export const create = async (data) => {
  try {
    // Verificar que el cliente existe
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, deleted: false },
    })
    if (!customer) return generateResponse(404, false, 'Cliente no encontrado')

    // Verificar que el plan existe
    const plan = await prisma.plan.findFirst({
      where: { id: data.planId, deleted: false, active: true },
    })
    if (!plan) return generateResponse(404, false, 'Plan no encontrado o inactivo')

    // Verificar que el cliente no tenga ya un contrato activo
    const activeContract = await prisma.contract.findFirst({
      where: { customerId: data.customerId, status: 'ACTIVE', deleted: false },
    })
    if (activeContract) {
      return generateResponse(409, false, 'El cliente ya tiene un contrato activo')
    }

    const contract = await prisma.contract.create({
      data: {
        customerId: data.customerId,
        planId: data.planId,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
      },
      include: {
        customer: { select: { id: true, name: true, lastName: true } },
        plan: { select: { id: true, name: true, mbps: true, price: true } },
      },
    })

    return generateResponse(201, true, 'Contrato creado', contract)
  } catch (error) {
    return generateResponse(500, false, 'Error al crear contrato', null, error.message)
  }
}

export const updateStatus = async (id, status) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id, ...baseWhere },
    })
    if (!contract) return generateResponse(404, false, 'Contrato no encontrado')

    if (contract.status === status) {
      return generateResponse(400, false, `El contrato ya está en estado ${status}`)
    }

    const data = { status }

    // Si se cancela, registrar la fecha de fin
    if (status === 'CANCELLED') {
      data.endDate = new Date()
    }

    // Si se suspende, registrar la fecha de fin
    if (status === 'SUSPENDED') {
      data.endDate = new Date()
    }

    const updated = await prisma.contract.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true, lastName: true } },
        plan: { select: { id: true, name: true } },
      },
    })

    return generateResponse(200, true, `Contrato ${status.toLowerCase()}`, updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar contrato', null, error.message)
  }
}

export const remove = async (id) => {
  try {
    const contract = await prisma.contract.findFirst({ where: { id, ...baseWhere } })
    if (!contract) return generateResponse(404, false, 'Contrato no encontrado')

    if (contract.status === 'ACTIVE') {
      return generateResponse(409, false, 'No se puede eliminar un contrato activo')
    }

    await prisma.contract.update({
      where: { id },
      data: { deleted: true },
    })

    return generateResponse(200, true, 'Contrato eliminado')
  } catch (error) {
    return generateResponse(500, false, 'Error al eliminar contrato', null, error.message)
  }
}