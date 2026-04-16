import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.js'
import * as landingController from '../controllers/landing.controller.js'

const router = Router()

// ─── Público ──────────────────────────────────────────────────────────────────
router.get('/content', landingController.getContent)

// ─── Config ───────────────────────────────────────────────────────────────────
router.get('/config',   authenticate, landingController.getConfig)
router.patch('/config', authenticate, authorize('ADMIN'), landingController.updateConfig)

// ─── Hero ─────────────────────────────────────────────────────────────────────
router.get('/hero', authenticate, landingController.getHero)
router.put('/hero', authenticate, authorize('ADMIN'), landingController.updateHero)

// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services',       authenticate, landingController.getServices)
router.post('/services',      authenticate, authorize('ADMIN'), landingController.createService)
router.patch('/services/:id', authenticate, authorize('ADMIN'), landingController.updateService)
router.delete('/services/:id',authenticate, authorize('ADMIN'), landingController.removeService)

// ─── Products ─────────────────────────────────────────────────────────────────
router.get('/products',       authenticate, landingController.getProducts)
router.post('/products',      authenticate, authorize('ADMIN'), landingController.createProduct)
router.patch('/products/:id', authenticate, authorize('ADMIN'), landingController.updateProduct)
router.delete('/products/:id',authenticate, authorize('ADMIN'), landingController.removeProduct)

// ─── News ─────────────────────────────────────────────────────────────────────
router.get('/news',       authenticate, landingController.getNews)
router.post('/news',      authenticate, authorize('ADMIN'), landingController.createNews)
router.patch('/news/:id', authenticate, authorize('ADMIN'), landingController.updateNews)
router.delete('/news/:id',authenticate, authorize('ADMIN'), landingController.removeNews)

// ─── Contacts ─────────────────────────────────────────────────────────────────
router.get('/contacts',              authenticate, authorize('ADMIN'), landingController.getContacts)
router.patch('/contacts/:id',        authenticate, authorize('ADMIN'), landingController.updateContactStatus)
router.post('/contacts/:id/reply',   authenticate, authorize('ADMIN'), landingController.replyContact)

export default router
