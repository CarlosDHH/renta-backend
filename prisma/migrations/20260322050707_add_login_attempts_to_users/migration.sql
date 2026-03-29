-- AlterTable
ALTER TABLE "users" ADD COLUMN     "blocked_until" TIMESTAMP(3),
ADD COLUMN     "login_attempts" INTEGER NOT NULL DEFAULT 0;
