import * as svc from '../services/email.service.js'

export const sendReceipt = async (req, res, next) => {
  try {
    const { customerEmail, receiptData } = req.body
    const result = await svc.sendReceipt(customerEmail, receiptData, null)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const sendReminder = async (req, res, next) => {
  try {
    const { customerEmail, reminderData } = req.body
    const result = await svc.sendReminder(customerEmail, reminderData)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const sendPendingReminders = async (req, res, next) => {
  try {
    const result = await svc.sendPendingReminders()
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}