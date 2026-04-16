import * as svc from '../services/landing.service.js'

// ─── Content público ──────────────────────────────────────────────────────────

export const getContent = async (req, res, next) => {
  try {
    const result = await svc.getContent()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const submitContact = async (req, res, next) => {
  try {
    const result = await svc.submitContact(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const getConfig = async (req, res, next) => {
  try {
    const result = await svc.getConfig()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const updateConfig = async (req, res, next) => {
  try {
    const result = await svc.updateConfig(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export const getHero = async (req, res, next) => {
  try {
    const result = await svc.getHero()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const updateHero = async (req, res, next) => {
  try {
    const result = await svc.updateHero(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

// ─── Services ─────────────────────────────────────────────────────────────────

export const getServices = async (req, res, next) => {
  try {
    const result = await svc.getServices()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const createService = async (req, res, next) => {
  try {
    const result = await svc.createService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const updateService = async (req, res, next) => {
  try {
    const result = await svc.updateService(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const removeService = async (req, res, next) => {
  try {
    const result = await svc.removeService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async (req, res, next) => {
  try {
    const result = await svc.getProducts()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const createProduct = async (req, res, next) => {
  try {
    const result = await svc.createProduct(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const updateProduct = async (req, res, next) => {
  try {
    const result = await svc.updateProduct(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const removeProduct = async (req, res, next) => {
  try {
    const result = await svc.removeProduct(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

// ─── News ─────────────────────────────────────────────────────────────────────

export const getNews = async (req, res, next) => {
  try {
    const result = await svc.getNews()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const createNews = async (req, res, next) => {
  try {
    const result = await svc.createNews(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const updateNews = async (req, res, next) => {
  try {
    const result = await svc.updateNews(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const removeNews = async (req, res, next) => {
  try {
    const result = await svc.removeNews(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const getContacts = async (req, res, next) => {
  try {
    const result = await svc.getContacts()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const replyContact = async (req, res, next) => {
  try {
    const result = await svc.replyContact(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const updateContactStatus = async (req, res, next) => {
  try {
    const result = await svc.updateContactStatus(req.params.id, req.body.status)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}
