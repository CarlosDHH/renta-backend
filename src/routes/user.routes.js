import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.js'
import * as userController from '../controllers/user.controller.js'

const router = Router()

router.use(authenticate)

router.get('/',     authorize('ADMIN'),              userController.getAll)
router.get('/:id',  authorize('ADMIN'),              userController.getById)
router.post('/',    authorize('ADMIN'),              userController.create)
router.patch('/:id',  authorize('ADMIN'),              userController.update)
router.delete('/:id', authorize('ADMIN'),            userController.remove)

export default router