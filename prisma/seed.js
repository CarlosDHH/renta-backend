import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const existing = await prisma.user.findFirst({ where: { email: 'admin@rentas.com' } })

  if (existing) {
    console.log('Usuario ya existe:', existing.email)
    return
  }

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      lastName: 'Sistema',
      email: 'admin@rentas.com',
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('Usuario creado:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())