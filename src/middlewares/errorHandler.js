import { generateResponse } from '../utils/handleResponse.js'

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack)

  if (err.code === 'P2025') {
    return res.status(404).json(generateResponse(404, false, 'Recurso no encontrado'))
  }
  if (err.code === 'P2002') {
    return res.status(409).json(generateResponse(409, false, 'Ya existe un registro con ese valor único'))
  }

  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'
  return res.status(status).json(generateResponse(status, false, message))
}