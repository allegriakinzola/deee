-- AlterTable
ALTER TABLE "Redeem" ADD COLUMN "rewardId" TEXT;
ALTER TABLE "Redeem" ADD COLUMN "rewardLabel" TEXT;
ALTER TABLE "Redeem" ADD COLUMN "partnerKind" "PartnerKind";
ALTER TABLE "Redeem" ADD COLUMN "usdValue" DECIMAL(10, 2);

UPDATE "Redeem"
SET
  "rewardId" = 'legacy',
  "rewardLabel" = 'Échange de bons',
  "partnerKind" = 'TELECOM',
  "usdValue" = "bons" * 10
WHERE "rewardId" IS NULL;

ALTER TABLE "Redeem" ALTER COLUMN "rewardId" SET NOT NULL;
ALTER TABLE "Redeem" ALTER COLUMN "rewardLabel" SET NOT NULL;
ALTER TABLE "Redeem" ALTER COLUMN "partnerKind" SET NOT NULL;
ALTER TABLE "Redeem" ALTER COLUMN "usdValue" SET NOT NULL;
