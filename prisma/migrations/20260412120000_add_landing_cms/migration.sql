-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ', 'REPLIED');

-- CreateTable
CREATE TABLE "landing_config" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "primary_color" VARCHAR(7) NOT NULL,
    "accent_color" VARCHAR(7) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "landing_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_hero" (
    "id" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "headline_accent" TEXT NOT NULL,
    "subheadline" TEXT NOT NULL,
    "cta_primary" TEXT NOT NULL,
    "cta_secondary" TEXT NOT NULL,
    "stat_value" TEXT NOT NULL,
    "stat_label" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "landing_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_services" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "landing_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "image_alt" TEXT NOT NULL,
    "badge" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "landing_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_news" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "landing_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "service_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_contacts_pkey" PRIMARY KEY ("id")
);

-- Seed: fila única inicial para landing_config
INSERT INTO "landing_config" ("id", "company_name", "tagline", "primary_color", "accent_color", "updated_at")
VALUES (gen_random_uuid(), 'NexLink', 'Precisión en Conectividad', '#2563eb', '#7c3aed', NOW());

-- Seed: fila única inicial para landing_hero
INSERT INTO "landing_hero" ("id", "badge", "headline", "headline_accent", "subheadline", "cta_primary", "cta_secondary", "stat_value", "stat_label", "updated_at")
VALUES (gen_random_uuid(), 'Internet de Alta Velocidad', 'Conectividad que', 'Transforma tu Mundo', 'Planes de internet para hogar y empresa con la mejor cobertura y velocidad garantizada.', 'Ver Planes', 'Contáctanos', '+500', 'Clientes satisfechos', NOW());
