import PDFDocument from 'pdfkit'

export const generateReceiptPdf = (receipt) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const buffers = []

      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      const { payment } = receipt
      const { contract } = payment
      const { customer, plan } = contract

      // ─── Colores ───────────────────────────────────────────
      const PRIMARY = '#1e293b'
      const ACCENT  = '#3b82f6'
      const GRAY    = '#64748b'
      const LIGHT   = '#f1f5f9'
      const SUCCESS = '#16a34a'

      // ─── Header ────────────────────────────────────────────
      doc.rect(0, 0, 612, 120).fill(PRIMARY)

      doc.fontSize(24)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text('Renta Internet', 50, 35)

      doc.fontSize(10)
         .fillColor('#94a3b8')
         .font('Helvetica')
         .text('Comprobante de pago', 50, 65)

      // Folio en header
      doc.fontSize(10)
         .fillColor('#94a3b8')
         .text('Folio', 430, 35)

      doc.fontSize(14)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text(receipt.folio, 430, 52)

      // ─── Fecha ─────────────────────────────────────────────
      doc.fontSize(9)
         .fillColor('#94a3b8')
         .font('Helvetica')
         .text(`Fecha: ${new Date(receipt.createdAt).toLocaleDateString('es-MX', {
           year: 'numeric', month: 'long', day: 'numeric'
         })}`, 430, 75)

      // ─── Datos del cliente ─────────────────────────────────
      doc.moveDown(3)

      doc.fontSize(11)
         .fillColor(GRAY)
         .font('Helvetica-Bold')
         .text('DATOS DEL CLIENTE', 50, 145)

      doc.moveTo(50, 160).lineTo(562, 160).strokeColor(LIGHT).lineWidth(1).stroke()

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Nombre:', 50, 170)
      doc.font('Helvetica').fillColor(GRAY)
         .text(`${customer.name} ${customer.lastName}`, 160, 170)

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Municipio:', 50, 188)
      doc.font('Helvetica').fillColor(GRAY)
         .text(`${customer.municipality}, ${customer.city}`, 160, 188)

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Teléfono:', 50, 206)
      doc.font('Helvetica').fillColor(GRAY)
         .text(customer.phone, 160, 206)

      // ─── Datos del plan ────────────────────────────────────
      doc.fontSize(11)
         .fillColor(GRAY)
         .font('Helvetica-Bold')
         .text('DETALLE DEL SERVICIO', 50, 245)

      doc.moveTo(50, 260).lineTo(562, 260).strokeColor(LIGHT).lineWidth(1).stroke()

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Plan:', 50, 270)
      doc.font('Helvetica').fillColor(GRAY)
         .text(plan.name, 160, 270)

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Velocidad:', 50, 288)
      doc.font('Helvetica').fillColor(GRAY)
         .text(`${plan.mbps} Mbps`, 160, 288)

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Período:', 50, 306)
      doc.font('Helvetica').fillColor(GRAY)
         .text(
           `${new Date(payment.periodFrom).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })} — ${new Date(payment.periodTo).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`,
           160, 306
         )

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Método de pago:', 50, 324)
      doc.font('Helvetica').fillColor(GRAY)
         .text(payment.paymentMethod === 'CASH' ? 'Efectivo' : payment.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta', 160, 324)

      doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
         .text('Tipo de pago:', 50, 342)
      doc.font('Helvetica').fillColor(GRAY)
         .text(
           payment.paymentType === 'FULL' ? 'Pago completo' :
           payment.paymentType === 'PARTIAL_ADVANCE' ? 'Pago parcial adelantado' : 'Pago parcial atrasado',
           160, 342
         )

      if (payment.notes) {
        doc.fontSize(10).fillColor(PRIMARY).font('Helvetica-Bold')
           .text('Notas:', 50, 360)
        doc.font('Helvetica').fillColor(GRAY)
           .text(payment.notes, 160, 360)
      }

      // ─── Monto ─────────────────────────────────────────────
      doc.rect(50, 400, 512, 80).fill(LIGHT).stroke()

      doc.fontSize(12)
         .fillColor(GRAY)
         .font('Helvetica-Bold')
         .text('TOTAL PAGADO', 70, 418)

      doc.fontSize(28)
         .fillColor(SUCCESS)
         .font('Helvetica-Bold')
         .text(`$${Number(payment.amount).toFixed(2)} MXN`, 70, 438)

      if (payment.balance && Number(payment.balance) > 0) {
        doc.fontSize(10)
           .fillColor('#dc2626')
           .font('Helvetica')
           .text(`Saldo pendiente: $${Number(payment.balance).toFixed(2)} MXN`, 350, 445)
      }

      // ─── Registrado por ────────────────────────────────────
      doc.fontSize(9)
         .fillColor(GRAY)
         .font('Helvetica')
         .text(
           `Registrado por: ${payment.user.name} ${payment.user.lastName}`,
           50, 505
         )

      // ─── Footer ────────────────────────────────────────────
      doc.rect(0, 720, 612, 122).fill(LIGHT)

      doc.fontSize(9)
         .fillColor(GRAY)
         .font('Helvetica')
         .text('Este comprobante es un documento válido de pago.', 50, 735, { align: 'center', width: 512 })

      doc.fontSize(8)
         .fillColor('#94a3b8')
         .text(`Folio de verificación: ${receipt.folio}`, 50, 752, { align: 'center', width: 512 })

      doc.fontSize(8)
         .fillColor(ACCENT)
         .text('Renta Internet — Sistema de gestión', 50, 768, { align: 'center', width: 512 })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}