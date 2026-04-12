-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'PARTIAL_ADVANCE', 'PARTIAL_LATE');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "last_paid_period" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "balance" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payment_type" "PaymentType" NOT NULL DEFAULT 'FULL';
