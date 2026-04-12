# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (with hot reload via --watch)
npm run dev

# Start production server
npm start

# Database operations
docker compose up -d          # Start PostgreSQL 16 container
npm run prisma:migrate        # Run migrations
npm run prisma:generate       # Regenerate Prisma client after schema changes
npm run prisma:seed           # Seed initial admin user
npm run prisma:studio         # Open Prisma Studio at http://localhost:5555
```

There are no configured test or lint commands.

## Architecture Overview

**Internet rental management system** backend — Express.js + PostgreSQL via Prisma ORM.

### Request Flow

Routes → Controllers → Services → Prisma (database)

All responses are formatted through `generateResponse(statusCode, success, message, data, errors)` in `src/utils/handleResponse.js`.

### Domain Modules

| Domain | Purpose |
|---|---|
| Auth | JWT login/refresh, account locking (5 attempts → 15 min block) |
| Users | Admin and Operator user management |
| Customers | Internet service clients |
| Plans | Service tiers (MBPS-based pricing) |
| Contracts | Link customers to plans; statuses: ACTIVE, SUSPENDED, CANCELLED |
| Payments | Track payments; types: FULL, PARTIAL_ADVANCE, PARTIAL_LATE |
| Receipts | PDF generation (PDFKit) and delivery via email/WhatsApp |
| Email | Nodemailer SMTP + Twilio WhatsApp notifications |

### Key Data Relationships

```
Customer → (many) Contracts → (many) Payments → (one) Receipt
Plan     → (many) Contracts
User     → (many) Payments (operator who registered payment)
```

All models use soft deletes (`deleted` flag). PDFs are stored locally at `./storage/pdfs`.

### Authentication

JWT Bearer tokens required on all protected routes. Two tokens issued at login:
- Access token: 15 min (`JWT_SECRET`)
- Refresh token: 7 days (`JWT_REFRESH_SECRET`)

`authenticate()` verifies the access token; `authorize(...roles)` checks roles (ADMIN, OPERATOR).

### Environment Setup

Copy `.env.example` to `.env`. Key variables:
- `DATABASE_URL` — PostgreSQL connection string (Docker default: port 5433)
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — must be ≥32 chars
- `CORS_ORIGIN` — frontend origin (default: `http://localhost:4200`)
- `PDF_STORAGE_PATH` — local path for generated PDFs
- `TWILIO_*` — WhatsApp integration credentials

### Error Handling

`src/middlewares/errorHandler.js` maps Prisma error codes to HTTP status codes:
- `P2025` → 404
- `P2002` → 409 (unique constraint violation)
