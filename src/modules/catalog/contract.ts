import type { CatalogStatus } from "@/generated/prisma/client"

export type DirectoryCatalog = {
  id: string
  name: string
  slug: string
  description: string | null
  usdPerPoint: string
  bonUsdValue: string
  pointsPerBon: number
  status: CatalogStatus
  itemCount: number
  createdAt: string
}

export type DirectoryCatalogItem = {
  id: string
  category: string
  name: string
  unit: string
  points: number
  usdEquivalent: string
  remarks: string | null
  status: CatalogStatus
}

export type DirectoryCatalogDetail = DirectoryCatalog & {
  items: DirectoryCatalogItem[]
}
