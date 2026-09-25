import "server-only"

import type { CatalogStatus } from "@/generated/prisma/client"

import { countMaterials } from "./repository"

export async function countDirectoryMaterials(status?: CatalogStatus) {
  return countMaterials(status)
}
