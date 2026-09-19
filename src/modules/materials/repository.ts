import "server-only"

import type { CatalogStatus } from "@/generated/prisma/client"

import { prisma } from "@/platform/db"

export async function listMaterials() {
  return prisma.material.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })
}

export async function listActiveMaterials() {
  return prisma.material.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })
}

export async function findMaterialById(id: string) {
  return prisma.material.findUnique({ where: { id } })
}

export async function findMaterialByName(category: string, name: string) {
  return prisma.material.findUnique({
    where: { category_name: { category, name } },
  })
}

export async function createMaterialRecord(input: {
  category: string
  name: string
  image: string
  unit: string
  points: number
  remarks: string | null
}) {
  return prisma.material.create({ data: input })
}

export async function updateMaterialRecord(
  id: string,
  data: {
    category?: string
    name?: string
    image?: string
    points?: number
    remarks?: string | null
  }
) {
  return prisma.material.update({
    where: { id },
    data,
  })
}

export async function updateMaterialStatus(id: string, status: CatalogStatus) {
  return prisma.material.update({
    where: { id },
    data: { status },
  })
}

export async function deleteMaterialRecord(id: string) {
  return prisma.material.delete({ where: { id } })
}
