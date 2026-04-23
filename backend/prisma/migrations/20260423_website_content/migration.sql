-- CreateTable
CREATE TABLE "website_journeys" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "regions" TEXT NOT NULL,
    "duration_nights" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "price_per_guest" INTEGER NOT NULL,
    "original_price" INTEGER NOT NULL,
    "departure_port" TEXT NOT NULL,
    "return_port" TEXT NOT NULL,
    "departure_date" TEXT NOT NULL,
    "return_date" TEXT NOT NULL,
    "ports" INTEGER NOT NULL DEFAULT 2,
    "countries" INTEGER NOT NULL DEFAULT 1,
    "vehicle" TEXT NOT NULL DEFAULT 'Premium SUV',
    "badges" JSONB NOT NULL,
    "images" JSONB NOT NULL,
    "map_image" TEXT,
    "overview" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_journey_days" (
    "id" TEXT NOT NULL,
    "journey_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,

    CONSTRAINT "website_journey_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_destinations" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "last_updated" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "trending_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "website_journeys_slug_key" ON "website_journeys"("slug");
CREATE INDEX "website_journeys_is_active_idx" ON "website_journeys"("is_active");
CREATE INDEX "website_journeys_sequence_idx" ON "website_journeys"("sequence");
CREATE INDEX "website_journey_days_journey_id_idx" ON "website_journey_days"("journey_id");
CREATE INDEX "trending_destinations_is_active_idx" ON "trending_destinations"("is_active");

-- AddForeignKey
ALTER TABLE "website_journey_days" ADD CONSTRAINT "website_journey_days_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "website_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
