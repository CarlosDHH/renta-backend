# 1. Levantar PostgreSQL con Docker
docker compose up -d

# 2. Instalar dependencias (si no lo has hecho)
npm install

# 3. Crear las tablas en la BD
npm run prisma:migrate

# 4. Generar el cliente de Prisma
npm run prisma:generate