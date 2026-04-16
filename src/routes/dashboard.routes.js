import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import * as dashboardController from '../controllers/dashboard.controller.js'

const router = Router()

router.use(authenticate)

router.get('/summary', dashboardController.getSummary)

export default router
