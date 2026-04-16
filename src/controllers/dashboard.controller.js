import * as svc from '../services/dashboard.service.js'

export const getSummary = async (req, res, next) => {
  try {
    const result = await svc.getSummary(req.query)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}
