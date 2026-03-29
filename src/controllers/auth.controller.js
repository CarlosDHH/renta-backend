import * as authService from '../services/auth.service.js'

export const login = async (req, res, next) => {
  const result = await authService.login(req.body.email, req.body.password)
  return res.status(result.statusCode).json(result);
}

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json(generateResponse(400, false, 'refreshToken es requerido'))
    }

    const result = authService.refreshToken(refreshToken)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    next(error)
  }
}
