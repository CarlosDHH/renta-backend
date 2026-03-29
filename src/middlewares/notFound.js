import { generateResponse } from '../utils/handleResponse.js'

export const notFound = (req, res) => {
  return res.status(404).json(generateResponse(404, false, `Ruta ${req.originalUrl} no encontrada`))
}