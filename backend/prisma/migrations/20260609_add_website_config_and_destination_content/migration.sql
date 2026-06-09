-- AlterTable
ALTER TABLE "destination_cms" ADD COLUMN "page_content" JSONB;

-- CreateTable
CREATE TABLE "website_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "website_configs_key_key" ON "website_configs"("key");
