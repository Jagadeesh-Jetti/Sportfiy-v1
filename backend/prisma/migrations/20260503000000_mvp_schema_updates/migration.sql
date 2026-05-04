-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';

-- CreateIndex
CREATE UNIQUE INDEX "Slot_venueId_date_startTime_key" ON "Slot"("venueId", "date", "startTime");

-- CreateIndex
CREATE INDEX "Venue_city_idx" ON "Venue"("city");
