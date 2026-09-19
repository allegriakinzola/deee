import type { CatalogStatus } from "@/generated/prisma/client"

export type DirectoryMaterial = {
  id: string
  category: string
  name: string
  image: string
  unit: string
  points: number
  usdEquivalent: string
  remarks: string | null
  status: CatalogStatus
  createdAt: string
}
