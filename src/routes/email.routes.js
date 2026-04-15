import { Router } from 'express'
import * as ctrl from '../controllers/email.controller.js'
// import { auth } from '../middlewares/auth.js'

const router = Router()

// router.use(auth)

router.post('/receipt', ctrl.sendReceipt)
router.post('/reminder', ctrl.sendReminder)
router.post('/reminders/send-pending', ctrl.sendPendingReminders)

export default router