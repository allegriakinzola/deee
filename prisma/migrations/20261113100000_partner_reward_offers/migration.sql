-- CreateEnum
CREATE TYPE "RewardKind" AS ENUM ('FORFAIT', 'PRODUIT', 'SERVICE');

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "rewardKind" "RewardKind" NOT NULL DEFAULT 'PRODUIT';

-- Un télécom échange contre un forfait. Les autres partenaires restent sur un produit physique.
UPDATE "Partner" SET "rewardKind" = 'FORFAIT' WHERE "kind" = 'TELECOM';

-- CreateTable
CREATE TABLE "PartnerOffer" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "RewardKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerOffer_partnerId_label_key" ON "PartnerOffer"("partnerId", "label");

-- CreateIndex
CREATE INDEX "PartnerOffer_partnerId_idx" ON "PartnerOffer"("partnerId");

-- AddForeignKey
ALTER TABLE "PartnerOffer" ADD CONSTRAINT "PartnerOffer_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
