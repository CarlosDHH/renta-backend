import * as userService from '../services/user.service.js'

export const getAll = async (req, res, next) => {
  try {
    const result = await userService.getAll(req.query)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const getById = async (req, res, next) => {
  try {
    const result = await userService.getById(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const create = async (req, res, next) => {
  try {
    const result = await userService.create(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const update = async (req, res, next) => {
  try {
    const result = await userService.update(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const remove = async (req, res, next) => {
  try {
    const result = await userService.remove(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}