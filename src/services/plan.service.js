import prisma from '../config/prisma.js'
import { generateResponse } from '../utils/handleResponse.js'
import { paginate, paginatedResponse } from '../utils/queryHelpers.js'

const baseWhere = { deleted: false }

export const getAll = async ({ page, limit, search, active } = {}) => {
  try {
    const where = {
      ...baseWhere,
      ...(active !== undefined && { active: active === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { price: 'asc' },
      }),
      prisma.plan.count({ where }),
    ])

    return generateResponse(200, true, 'Planes obtenidos', paginatedResponse(plans, total, page, limit))
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener planes', null, error.message)
  }
}

export const getById = async (id) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: { id, ...baseWhere },
      include: {
        contracts: {
          where: { deleted: false, status: 'ACTIVE' },
          select: { id: true, customer: { select: { name: true, lastName: true } } },
        },
      },
    })

    if (!plan) return generateResponse(404, false, 'Plan no encontrado')

    return generateResponse(200, true, 'Plan obtenido', plan)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener plan', null, error.message)
  }
}

export const create = async (data) => {
  try {
    const exists = await prisma.plan.findFirst({
      where: { name: data.name, ...baseWhere },
    })
    if (exists) return generateResponse(409, false, 'Ya existe un plan con ese nombre')

    const plan = await prisma.plan.create({ data })

    return generateResponse(201, true, 'Plan creado', plan)
  } catch (error) {
    return generateResponse(500, false, 'Error al crear plan', null, error.message)
  }
}

export const update = async (id, data) => {
  try {
    const plan = await prisma.plan.findFirst({ where: { id, ...baseWhere } })
    if (!plan) return generateResponse(404, false, 'Plan no encontrado')

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.mbps && { mbps: Number(data.mbps) }),
        ...(data.price && { price: data.price }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.active !== undefined && { active: data.active }),
      },
    })

    return generateResponse(200, true, 'Plan actualizado', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar plan', null, error.message)
  }
}

export const remove = async (id) => {
  try {
    const plan = await prisma.plan.findFirst({ where: { id, ...baseWhere } })
    if (!plan) return generateResponse(404, false, 'Plan no encontrado')

    // Verificar si tiene contratos activos antes de eliminar
    const activeContracts = await prisma.contract.count({
      where: { planId: id, status: 'ACTIVE', deleted: false },
    })

    if (activeContracts > 0) {
      return generateResponse(409, false, `No se puede eliminar el plan, tiene ${activeContracts} contrato(s) activo(s)`)
    }

    await prisma.plan.update({
      where: { id },
      data: { deleted: true, active: false },
    })

    return generateResponse(200, true, 'Plan eliminado')
  } catch (error) {
    return generateResponse(500, false, 'Error al eliminar plan', null, error.message)
  }
}