import * as svc from '../services/receipt.service.js'
import { generateReceiptPdf } from '../services/pdf.service.js'

export const getPdf = async (req, res, next) => {
  try {
    const receiptResult = await svc.getById(req.params.id)

    if (!receiptResult.success) {
      return res.status(receiptResult.statusCode).json(receiptResult)
    }

    const pdfBuffer = await generateReceiptPdf(receiptResult.data)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="comprobante-${receiptResult.data.folio}.pdf"`,
      'Content-Length': pdfBuffer.length,
    })

    return res.send(pdfBuffer)
  } catch (error) {
    next(error)
  }
}

export const getAll = async (req, res, next) => {
  try {
    const result = await svc.getAll(req.query)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const getById = async (req, res, next) => {
  try {
    const result = await svc.getById(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const getByFolio = async (req, res, next) => {
  try {
    const result = await svc.getByFolio(req.params.folio)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const validateFolio = async (req, res, next) => {
  try {
    const result = await svc.validateFolio(req.params.folio)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}

export const markAsSent = async (req, res, next) => {
  try {
    const { recipientPhone } = req.body
    const result = await svc.markAsSent(req.params.id, recipientPhone)
    return res.status(result.statusCode).json(result)
  } catch (error) { next(error) }
}