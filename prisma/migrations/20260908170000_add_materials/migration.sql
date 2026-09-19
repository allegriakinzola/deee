-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Pièce',
    "points" INTEGER NOT NULL,
    "remarks" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Material" ("id", "category", "name", "unit", "points", "remarks", "status", "createdAt", "updatedAt")
SELECT DISTINCT ON ("category", "name")
    "id",
    "category",
    "name",
    "unit",
    "points",
    "remarks",
    "status",
    "createdAt",
    "updatedAt"
FROM "CatalogItem"
ORDER BY "category", "name", "createdAt" ASC;

CREATE UNIQUE INDEX "Material_category_name_key" ON "Material"("category", "name");
CREATE INDEX "Material_category_idx" ON "Material"("category");
CREATE INDEX "Material_status_idx" ON "Material"("status");
