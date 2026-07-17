-- AlterTable
ALTER TABLE "tour_drivers" ADD COLUMN     "destination_lat" DOUBLE PRECISION,
ADD COLUMN     "destination_lng" DOUBLE PRECISION,
ADD COLUMN     "destination_location" TEXT,
ADD COLUMN     "eta_minutes" INTEGER,
ADD COLUMN     "last_loc_update" TIMESTAMP(3),
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "pickup_lat" DOUBLE PRECISION,
ADD COLUMN     "pickup_lng" DOUBLE PRECISION,
ADD COLUMN     "pickup_location" TEXT,
ADD COLUMN     "ride_status" TEXT NOT NULL DEFAULT 'IDLE';

-- CreateTable
CREATE TABLE "hotel_requests" (
    "id" TEXT NOT NULL,
    "tour_code" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "room_no" TEXT,
    "request_type" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "guest_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hotel_requests" ADD CONSTRAINT "hotel_requests_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

