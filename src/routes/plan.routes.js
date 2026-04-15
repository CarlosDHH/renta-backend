import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.js'
import * as planController from '../controllers/plan.controller.js'

const router = Router()

router.use(authenticate)

router.get('/',       planController.getAll)
router.get('/:id',    planController.getById)
router.post('/',      authorize('ADMIN'), planController.create)
router.patch('/:id',    authorize('ADMIN'), planController.update)
router.delete('/:id', authorize('ADMIN'), planController.remove)

export default router