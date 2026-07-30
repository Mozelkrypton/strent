-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "avgRating" DOUBLE PRECISION,
ADD COLUMN     "avgRatingCondition" DOUBLE PRECISION,
ADD COLUMN     "avgRatingLandlord" DOUBLE PRECISION,
ADD COLUMN     "avgRatingLocation" DOUBLE PRECISION,
ADD COLUMN     "avgRatingUtilities" DOUBLE PRECISION,
ADD COLUMN     "avgRatingValue" DOUBLE PRECISION,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ratingLocation" INTEGER NOT NULL,
    "ratingValue" INTEGER NOT NULL,
    "ratingCondition" INTEGER NOT NULL,
    "ratingUtilities" INTEGER NOT NULL,
    "ratingLandlord" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_listingId_idx" ON "Review"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_listingId_tenantId_key" ON "Review"("listingId", "tenantId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
