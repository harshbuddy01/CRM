-- AlterTable
ALTER TABLE "invoices" 
ADD COLUMN "invoice_header_banner_url" TEXT,
ADD COLUMN "invoice_middle_banner_url" TEXT,
ADD COLUMN "invoice_qr_code_url" TEXT,
ADD COLUMN "invoice_logo_url" TEXT;
