-- AlterTable: Add login_id and login_password to hotels
ALTER TABLE "hotels" ADD COLUMN "login_id" TEXT;
ALTER TABLE "hotels" ADD COLUMN "login_password" TEXT;
CREATE UNIQUE INDEX "hotels_login_id_key" ON "hotels"("login_id");

-- AlterTable: Add login_id and login_password to drivers
ALTER TABLE "drivers" ADD COLUMN "login_id" TEXT;
ALTER TABLE "drivers" ADD COLUMN "login_password" TEXT;
CREATE UNIQUE INDEX "drivers_login_id_key" ON "drivers"("login_id");
