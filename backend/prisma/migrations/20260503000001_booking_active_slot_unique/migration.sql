-- Partial unique index: at most one non-cancelled booking per slot.
-- Prisma cannot express partial unique indexes natively, so this lives in a raw SQL migration.
-- This is the DB-level guarantee that prevents double-booking, paired with prisma.$transaction
-- at serializable isolation in the booking service.
CREATE UNIQUE INDEX "booking_active_slot_unique"
  ON "Booking"("slotId")
  WHERE "status" <> 'CANCELLED' AND "slotId" IS NOT NULL;
