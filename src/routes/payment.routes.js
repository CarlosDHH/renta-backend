import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.js'
import * as paymentController from '../controllers/payment.controller.js'

const router = Router()

router.use(authenticate)

router.get('/',       paymentController.getAll)
router.get('/:id',    paymentController.getById)
router.post('/',      authorize('ADMIN', 'OPERATOR'), paymentController.create)
router.delete('/:id', authorize('ADMIN'),             paymentController.remove)

export default router