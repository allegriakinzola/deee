-- CreateEnum
CREATE TYPE "RedeemStatus" AS ENUM ('SENT', 'CONFIRMED', 'REJECTED');

-- AlterEnum
ALTER TYPE "LedgerKind" ADD VALUE 'REDEEM_DEBIT';

-- CreateTable
CREATE TABLE "Redeem" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "status" "RedeemStatus" NOT NULL DEFAULT 'SENT',
    "bons" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redeem_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN "redeemId" TEXT;

CREATE INDEX "Redeem_citizenId_status_idx" ON "Redeem"("citizenId", "status");
CREATE INDEX "Redeem_shopId_status_idx" ON "Redeem"("shopId", "status");
CREATE UNIQUE INDEX "LedgerEntry_redeemId_kind_key" ON "LedgerEntry"("redeemId", "kind");

ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_redeemId_fkey" FOREIGN KEY ("redeemId") REFERENCES "Redeem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
