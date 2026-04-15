import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.js'
import * as contractController from '../controllers/contract.controller.js'

const router = Router()

router.use(authenticate)

router.get('/',              contractController.getAll)
router.get('/:id',           contractController.getById)
router.post('/',             authorize('ADMIN', 'OPERATOR'), contractController.create)
router.patch('/:id/status',  authorize('ADMIN'), contractController.updateStatus)
router.delete('/:id',        authorize('ADMIN'), contractController.remove)

export default router