import prisma from '../config/prisma.js'
import { generateResponse } from '../utils/handleResponse.js'
import { paginate, paginatedResponse } from '../utils/queryHelpers.js'

const baseWhere = { deleted: false }

export const getAll = async ({ page, limit, sendStatus } = {}) => {
  try {
    const where = {
      ...baseWhere,
      ...(sendStatus && { sendStatus }),
    }

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          payment: {
            include: {
              contract: {
                include: {
                  customer: { select: { id: true, name: true, lastName: true } },
                  plan: { select: { id: true, name: true } },
                },
              },
              user: { select: { id: true, name: true, lastName: true } },
            },
          },
        },
      }),
      prisma.receipt.count({ where }),
    ])

    return generateResponse(200, true, 'Comprobantes obtenidos', paginatedResponse(receipts, total, page, limit))
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener comprobantes', null, error.message)
  }
}

export const getById = async (id) => {
  try {
    const receipt = await prisma.receipt.findFirst({
      where: { id, ...baseWhere },
      include: {
        payment: {
          include: {
            contract: {
              include: {
                customer: true,
                plan: true,
              },
            },
            user: { select: { id: true, name: true, lastName: true } },
          },
        },
      },
    })

    if (!receipt) return generateResponse(404, false, 'Comprobante no encontrado')

    return generateResponse(200, true, 'Comprobante obtenido', receipt)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener comprobante', null, error.message)
  }
}

export const getByFolio = async (folio) => {
  try {
    const receipt = await prisma.receipt.findFirst({
      where: { folio, ...baseWhere },
      include: {
        payment: {
          include: {
            contract: {
              include: {
                customer: { select: { id: true, name: true, lastName: true } },
                plan: { select: { id: true, name: true, price: true } },
              },
            },
            user: { select: { id: true, name: true, lastName: true } },
          },
        },
      },
    })

    if (!receipt) return generateResponse(404, false, 'Folio no encontrado')

    return generateResponse(200, true, 'Comprobante obtenido', receipt)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener comprobante', null, error.message)
  }
}

export const validateFolio = async (folio) => {
  try {
    const receipt = await prisma.receipt.findFirst({
      where: { folio, ...baseWhere },
      select: {
        folio: true,
        createdAt: true,
        sendStatus: true,
        payment: {
          select: {
            amount: true,
            periodFrom: true,
            periodTo: true,
            paymentType: true,
            contract: {
              select: {
                customer: { select: { name: true, lastName: true } },
                plan: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    if (!receipt) {
      return generateResponse(404, false, 'Folio inválido — no se encontró en el sistema')
    }

    return generateResponse(200, true, 'Folio válido', { valid: true, receipt })
  } catch (error) {
    return generateResponse(500, false, 'Error al validar folio', null, error.message)
  }
}

export const markAsSent = async (id, recipientPhone) => {
  try {
    const receipt = await prisma.receipt.findFirst({ where: { id, ...baseWhere } })
    if (!receipt) return generateResponse(404, false, 'Comprobante no encontrado')

    if (receipt.sendStatus === 'SENT') {
      return generateResponse(400, false, 'El comprobante ya fue enviado')
    }

    const updated = await prisma.receipt.update({
      where: { id },
      data: {
        sendStatus: 'SENT',
        sentAt: new Date(),
        ...(recipientPhone && { recipientPhone }),
      },
    })

    return generateResponse(200, true, 'Comprobante marcado como enviado', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar comprobante', null, error.message)
  }
}