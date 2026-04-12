import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.js'
import * as receiptController from '../controllers/receipt.controller.js'

const router = Router()

router.use(authenticate)

router.get('/',                          receiptController.getAll)
router.get('/:id/pdf', receiptController.getPdf)
router.get('/folio/:folio',              receiptController.getByFolio)
router.get('/validate/:folio',           receiptController.validateFolio)
router.get('/:id',                       receiptController.getById)
router.patch('/:id/mark-sent',           authorize('ADMIN', 'OPERATOR'), receiptController.markAsSent)

export default router