-- AlterTable
ALTER TABLE "users" ADD COLUMN "two_factor_code" TEXT,
ADD COLUMN "two_factor_expires" TIMESTAMP(3),
ADD COLUMN "two_factor_session_id" TEXT;
