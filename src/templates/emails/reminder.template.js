export const reminderTemplate = ({ customerName, planName, amount, dueDate, daysLeft }) => {
  const fmt = (date) => new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
  const money = (n) => `$${Number(n).toFixed(2)} MXN`

  const isUrgent = daysLeft <= 1
  const headerColor = isUrgent ? '#e53935' : '#f57c00'
  const urgencyText = daysLeft === 0
    ? 'Tu servicio <strong>vence hoy</strong>.'
    : daysLeft === 1
      ? 'Tu servicio vence <strong>mañana</strong>.'
      : `Tu servicio vence en <strong>${daysLeft} días</strong>.`

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:${headerColor};padding:32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;">Recordatorio de Pago</h1>
              </td>
            </tr>

            <!-- Mensaje -->
            <tr>
              <td style="padding:32px 40px 0;">
                <p style="margin:0;color:#333;font-size:16px;">Hola <strong>${customerName}</strong>,</p>
                <p style="color:#555;font-size:14px;">${urgencyText} Realiza tu pago para no perder el servicio.</p>
              </td>
            </tr>

            <!-- Detalle -->
            <tr>
              <td style="padding:24px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:6px;padding:24px;">
                  <tr>
                    <td style="padding:8px 0;color:#555;font-size:14px;">Plan</td>
                    <td style="padding:8px 0;color:#333;font-size:14px;text-align:right;font-weight:bold;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#555;font-size:14px;border-top:1px solid #e0e0e0;">Fecha de vencimiento</td>
                    <td style="padding:8px 0;color:#333;font-size:14px;text-align:right;border-top:1px solid #e0e0e0;">${fmt(dueDate)}</td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0 8px;color:#333;font-size:18px;font-weight:bold;border-top:2px solid ${headerColor};">Monto a pagar</td>
                    <td style="padding:16px 0 8px;color:${headerColor};font-size:18px;font-weight:bold;text-align:right;border-top:2px solid ${headerColor};">${money(amount)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 40px 32px;text-align:center;color:#999;font-size:12px;">
                <p style="margin:0;">Si ya realizaste tu pago, ignora este mensaje.</p>
                <p style="margin:8px 0 0;">¿Dudas? Responde este correo.</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `
}