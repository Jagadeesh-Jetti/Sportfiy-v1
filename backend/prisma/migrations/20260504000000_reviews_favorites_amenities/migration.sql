-- Venue: amenities, denormalized rating aggregates, verification flag, phone
ALTER TABLE "Venue" ADD COLUMN "phone" TEXT;
ALTER TABLE "Venue" ADD COLUMN "amenities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Venue" ADD COLUMN "avgRating" DOUBLE PRECISION;
ALTER TABLE "Venue" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Venue" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Venue_avgRating_idx" ON "Venue"("avgRating");

-- Review: merchant reply + one-review-per-user-per-venue
ALTER TABLE "Review" ADD COLUMN "reply" TEXT;
ALTER TABLE "Review" ADD COLUMN "replyAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Review_userId_venueId_key" ON "Review"("userId", "venueId");
CREATE INDEX "Review_venueId_idx" ON "Review"("venueId");

-- Favorite: heart a venue
CREATE TABLE "Favorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "venueId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Favorite_userId_venueId_key" ON "Favorite"("userId", "venueId");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
ALTER TABLE "Favorite"
  ADD CONSTRAINT "Favorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite"
  ADD CONSTRAINT "Favorite_venueId_fkey"
  FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
