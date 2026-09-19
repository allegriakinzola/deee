-- CreateTable
CREATE TABLE "OperatorSettings" (
    "id" TEXT NOT NULL,
    "bonUsdValue" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatorSettings_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton from an existing catalogue when present.
INSERT INTO "OperatorSettings" ("id", "bonUsdValue", "updatedAt")
SELECT 'gvb', COALESCE(
  (SELECT "bonUsdValue" FROM "Catalog" ORDER BY "createdAt" ASC LIMIT 1),
  10
), CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Catalog" DROP COLUMN "bonUsdValue";
