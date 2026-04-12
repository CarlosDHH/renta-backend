-- CreateTable
CREATE TABLE "WhatsappSession" (
    "id" TEXT NOT NULL DEFAULT 'session',
    "creds" JSONB NOT NULL,
    "keys" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappSession_pkey" PRIMARY KEY ("id")
);
