import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'

import { notFound } from './middlewares/notFound.js'

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
app.use('/api/auth', authRoutes)

app.use('/api/users', userRoutes)
// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// ─── Manejo de errores ────────────────────────────────────────────────────────
app.use(notFound)

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`🌎 Entorno: ${process.env.NODE_ENV}`)
})

export default app
