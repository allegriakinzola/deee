-- CreateIndex
CREATE UNIQUE INDEX "CatalogItem_catalogId_category_name_key" ON "CatalogItem"("catalogId", "category", "name");
