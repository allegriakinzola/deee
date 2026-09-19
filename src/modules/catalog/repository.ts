import "server-only"

import type { CatalogStatus } from "@/generated/prisma/client"

import { prisma } from "@/platform/db"

export async function listCatalogsWithCounts() {
  return prisma.catalog.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  })
}

export async function findCatalogById(id: string) {
  return prisma.catalog.findUnique({
    where: { id },
    include: {
      items: { orderBy: [{ category: "asc" }, { name: "asc" }] },
    },
  })
}

export async function findCatalogBySlug(slug: string) {
  return prisma.catalog.findUnique({ where: { slug } })
}

export async function createCatalogRecord(input: {
  name: string
  slug: string
  description: string | null
  usdPerPoint: string
}) {
  return prisma.catalog.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      usdPerPoint: input.usdPerPoint,
    },
  })
}

export async function updateCatalogRecord(
  id: string,
  data: {
    name?: string
    slug?: string
    description?: string | null
    usdPerPoint?: string
  }
) {
  return prisma.catalog.update({
    where: { id },
    data,
  })
}

export async function updateCatalogStatus(id: string, status: CatalogStatus) {
  return prisma.catalog.update({
    where: { id },
    data: { status },
  })
}

export async function deleteCatalogRecord(id: string) {
  return prisma.catalog.delete({ where: { id } })
}

export async function findCatalogItem(catalogId: string, itemId: string) {
  return prisma.catalogItem.findFirst({
    where: { id: itemId, catalogId },
  })
}

export async function findCatalogItemByName(
  catalogId: string,
  category: string,
  name: string
) {
  return prisma.catalogItem.findFirst({
    where: {
      catalogId,
      category,
      name,
    },
  })
}

export async function createCatalogItemRecord(input: {
  catalogId: string
  category: string
  name: string
  description?: string | null
  unit: string
  points: number
  remarks: string | null
}) {
  return prisma.catalogItem.create({
    data: input,
  })
}

export async function updateCatalogItemRecord(
  itemId: string,
  data: {
    category?: string
    name?: string
    description?: string | null
    unit?: string
    points?: number
    remarks?: string | null
  }
) {
  return prisma.catalogItem.update({
    where: { id: itemId },
    data,
  })
}

export async function updateCatalogItemStatus(
  itemId: string,
  status: CatalogStatus
) {
  return prisma.catalogItem.update({
    where: { id: itemId },
    data: { status },
  })
}

export async function deleteCatalogItemRecord(itemId: string) {
  return prisma.catalogItem.delete({ where: { id: itemId } })
}
