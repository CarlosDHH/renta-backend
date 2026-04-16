import nodemailer from 'nodemailer'
import prisma from '../config/prisma.js'
import { generateResponse } from '../utils/handleResponse.js'
import { receiptTemplate } from '../templates/emails/receipt.template.js'
import { reminderTemplate } from '../templates/emails/reminder.template.js'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // true solo si usas port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

// Verifica la conexión al arrancar
export const verifyConnection = async () => {
  try {
    await transporter.verify()
    console.log('[Email] ✅ Conexión verificada')
    return true
  } catch (error) {
    console.error('[Email] ❌ Error de conexión:', error.message)
    return false
  }
}

// ─── Envíos ───────────────────────────────────────────────────────

export const sendReceipt = async (customerEmail, receiptData, pdfBuffer) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: customerEmail,
      subject: `Recibo de pago - Folio ${receiptData.folio}`,
      html: receiptTemplate(receiptData),
      attachments: [
        {
          filename: `recibo-${receiptData.folio}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })

    return generateResponse(200, true, 'Recibo enviado por correo')
  } catch (error) {
    return generateResponse(500, false, 'Error al enviar recibo', null, error.message)
  }
}

export const sendContactReply = async (to, name, subject, body) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html: `<p>Hola ${name},</p><p>${body}</p>`,
    })

    return generateResponse(200, true, 'Respuesta enviada')
  } catch (error) {
    return generateResponse(500, false, 'Error al enviar respuesta', null, error.message)
  }
}

export const sendReminder = async (customerEmail, reminderData) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: customerEmail,
      subject: `Recordatorio de pago - ${reminderData.planName}`,
      html: reminderTemplate(reminderData),
    })

    return generateResponse(200, true, 'Recordatorio enviado por correo')
  } catch (error) {
    return generateResponse(500, false, 'Error al enviar recordatorio', null, error.message)
  }
}

// Envío de recordatorios masivos — llamado por el cron
export const sendPendingReminders = async () => {
  try {
    const today = new Date()
    const in5Days = new Date(today)
    in5Days.setDate(today.getDate() + 5)

    // Busca contratos activos que vencen en 5 días o menos
    const contracts = await prisma.contract.findMany({
      where: {
        deleted: false,
        status: 'ACTIVE',
        dueDate: { lte: in5Days },
        customer: { 
          deleted: false,
          email: { not: null },
        },
      },
      include: {
        customer: true,
        plan: true,
      },
    })

    const results = await Promise.allSettled(
      contracts.map((contract) => {
        const daysLeft = Math.ceil((new Date(contract.dueDate) - today) / (1000 * 60 * 60 * 24))

        return sendReminder(contract.customer.email, {
          customerName: contract.customer.name,
          planName: contract.plan.name,
          amount: contract.plan.price,
          dueDate: contract.dueDate,
          daysLeft,
        })
      })
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    console.log(`[Email] Recordatorios: ${sent} enviados, ${failed} fallidos`)
    return generateResponse(200, true, `Recordatorios procesados: ${sent} enviados, ${failed} fallidos`)
  } catch (error) {
    return generateResponse(500, false, 'Error al procesar recordatorios', null, error.message)
  }
}