import "server-only"

import { usdFromPoints } from "@/modules/catalog"
import type { DirectoryMaterial } from "./contract"

export function toDirectoryMaterial(
  row: {
    id: string
    category: string
    name: string
    image: string
    unit: string
    points: number
    remarks: string | null
    status: DirectoryMaterial["status"]
    createdAt: Date
  },
  usdPerPoint: string
): DirectoryMaterial {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    image: row.image,
    unit: row.unit,
    points: row.points,
    usdEquivalent: usdFromPoints(row.points, usdPerPoint),
    remarks: row.remarks,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}
