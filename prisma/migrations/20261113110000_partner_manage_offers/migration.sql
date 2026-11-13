-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "offersReady" BOOLEAN NOT NULL DEFAULT false;

-- Offres par défaut pour les partenaires qui n'en ont pas encore.
INSERT INTO "PartnerOffer" ("id", "partnerId", "label", "kind", "sortOrder", "status", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    partner."id",
    defaults.label,
    partner."rewardKind",
    defaults."sortOrder",
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Partner" AS partner
JOIN (
    VALUES
        ('FORFAIT', 'Forfait data', 0),
        ('FORFAIT', 'Forfait appels', 1),
        ('PRODUIT', 'T-shirt', 0),
        ('PRODUIT', 'Képi', 1),
        ('PRODUIT', 'Powerbank', 2),
        ('SERVICE', 'Service en shop', 0)
) AS defaults(kind, label, "sortOrder")
    ON defaults.kind = partner."rewardKind"::text
WHERE NOT EXISTS (
    SELECT 1 FROM "PartnerOffer" AS offer WHERE offer."partnerId" = partner."id"
);

UPDATE "Partner" SET "offersReady" = true;
