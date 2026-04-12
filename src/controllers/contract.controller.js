import * as svc from '../services/contract.service.js'

export const getAll = async (req, res, next) => {
  try {
    const result = await svc.getAll(req.query)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const getById = async (req, res, next) => {
  try {
    const result = await svc.getById(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const create = async (req, res, next) => {
  try {
    const result = await svc.create(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ statusCode: 400, success: false, message: 'El campo status es requerido' })
    }
    const result = await svc.updateStatus(req.params.id, status)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const remove = async (req, res, next) => {
  try {
    const result = await svc.remove(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}