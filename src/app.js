import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import paymentRoutes from './routes/payment.routes.js'
import authRoutes from './routes/auth.routes.js'
import emailRoutes from './routes/email.routes.js'
import contractRoutes from './routes/contract.routes.js'
import customerRoutes from './routes/customer.routes.js'
import planRoutes from './routes/plan.routes.js'
import userRoutes from './routes/user.routes.js'
import receiptRoutes from './routes/receipt.routes.js'
import landingRoutes from './routes/landing.routes.js'
import { submitContact } from './controllers/landing.controller.js'


import { notFound } from './middlewares/notFound.js'

import { verifyConnection } from './services/email.service.js'

const app = express()
const PORT = process.env.PORT || 3000

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Rutas ────────────────────────────────────────────────────────────────────

app.use('/api/receipts', receiptRoutes)

app.use('/api/payments', paymentRoutes)

app.use('/api/email', emailRoutes)

app.use('/api/auth', authRoutes)

app.use('/api/contracts', contractRoutes)

app.use('/api/customers', customerRoutes)

app.use('/api/plans', planRoutes)

app.use('/api/users', userRoutes)

app.use('/api/landing', landingRoutes)

app.post('/api/contact', submitContact)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ─── Manejo de errores ────────────────────────────────────────────────────────
app.use(notFound)

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`🌎 Entorno: ${process.env.NODE_ENV}`)

  await verifyConnection()
  // app.listen(PORT, async () => {
  //   console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  // })
})

export default app
