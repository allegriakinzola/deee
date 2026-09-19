-- AlterTable
ALTER TABLE "Shop" ADD COLUMN "code" TEXT;

UPDATE "Shop"
SET "code" = 'K' || upper(substr(md5("id"), 1, 5))
WHERE "code" IS NULL;

ALTER TABLE "Shop" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "Shop_code_key" ON "Shop"("code");

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LedgerKind" AS ENUM ('DEPOSIT_CREDIT');

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "shopId" TEXT,
    "status" "DepositStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DepositLine" (
    "id" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pointsEach" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "DepositLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "depositId" TEXT,
    "kind" "LedgerKind" NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Deposit_citizenId_status_idx" ON "Deposit"("citizenId", "status");
CREATE INDEX "Deposit_shopId_status_idx" ON "Deposit"("shopId", "status");
CREATE UNIQUE INDEX "DepositLine_depositId_materialId_key" ON "DepositLine"("depositId", "materialId");
CREATE INDEX "LedgerEntry_userId_idx" ON "LedgerEntry"("userId");
CREATE UNIQUE INDEX "LedgerEntry_depositId_kind_key" ON "LedgerEntry"("depositId", "kind");

ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DepositLine" ADD CONSTRAINT "DepositLine_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DepositLine" ADD CONSTRAINT "DepositLine_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
