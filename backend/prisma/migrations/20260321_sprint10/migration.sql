-- Sprint 10 Migration: Post Sales, Vouchers, Documents + Schema Alterations

-- AlterTable: Add noteType to query_notes
ALTER TABLE "query_notes" ADD COLUMN "note_type" TEXT NOT NULL DEFAULT 'note';

-- AlterTable: Add communicationType to email_logs
ALTER TABLE "email_logs" ADD COLUMN "communication_type" TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE "email_logs" ADD COLUMN "to" TEXT;
ALTER TABLE "email_logs" ADD COLUMN "cc" TEXT;
ALTER TABLE "email_logs" ADD COLUMN "error_msg" TEXT;

-- CreateTable: booking_services
CREATE TABLE "booking_services" (
    "id" TEXT NOT NULL,
    "query_id" TEXT NOT NULL,
    "proposal_day_id" TEXT,
    "service_type" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "supplier_id" TEXT,
    "supplier_name" TEXT,
    "supplier_email" TEXT,
    "check_in" DATE,
    "check_out" DATE,
    "service_date" DATE,
    "rate_per_unit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "units" INTEGER NOT NULL DEFAULT 1,
    "total_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "supplier_amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "supplier_amount_pending" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mail_status" TEXT NOT NULL DEFAULT 'not_sent',
    "mail_sent_at" TIMESTAMP(3),
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "confirmation_number" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vouchers
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "query_id" TEXT NOT NULL,
    "booking_service_id" TEXT,
    "voucher_type" TEXT NOT NULL,
    "voucher_number" TEXT NOT NULL,
    "confirmation_number" TEXT,
    "supplier_name" TEXT,
    "hotel_name" TEXT,
    "destination" TEXT,
    "lead_pax_name" TEXT,
    "pax_details" TEXT,
    "check_in" DATE,
    "check_out" DATE,
    "room_type" TEXT,
    "meal_plan" TEXT,
    "greeting_message" TEXT,
    "pdf_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: query_documents
CREATE TABLE "query_documents" (
    "id" TEXT NOT NULL,
    "query_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_services_query_id_idx" ON "booking_services"("query_id");
CREATE INDEX "booking_services_service_type_idx" ON "booking_services"("service_type");

CREATE UNIQUE INDEX "vouchers_voucher_number_key" ON "vouchers"("voucher_number");
CREATE INDEX "vouchers_query_id_idx" ON "vouchers"("query_id");

CREATE INDEX "query_documents_query_id_idx" ON "query_documents"("query_id");

-- AddForeignKey
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_proposal_day_id_fkey" FOREIGN KEY ("proposal_day_id") REFERENCES "proposal_days"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_booking_service_id_fkey" FOREIGN KEY ("booking_service_id") REFERENCES "booking_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "query_documents" ADD CONSTRAINT "query_documents_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "query_documents" ADD CONSTRAINT "query_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
