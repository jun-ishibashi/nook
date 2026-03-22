-- AlterTable
ALTER TABLE "FurnitureItem" ADD COLUMN "brand" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FurnitureItem" ADD COLUMN "brandSlug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FurnitureItem" ADD COLUMN "pinX" DOUBLE PRECISION;
ALTER TABLE "FurnitureItem" ADD COLUMN "pinY" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ItemWishlist" ADD COLUMN "buyRank" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "FurnitureItem_brandSlug_idx" ON "FurnitureItem"("brandSlug");
