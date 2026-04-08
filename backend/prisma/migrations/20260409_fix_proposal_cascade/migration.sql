-- DropForeignKey
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_itinerary_id_fkey";

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
