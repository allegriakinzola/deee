import "server-only"

import type { DirectoryDeposit } from "./contract"

type LineRow = {
  id: string
  materialId: string
  name: string
  category: string
  image: string
  quantity: number
  pointsEach: number
}

type DepositRow = {
  id: string
  status: DirectoryDeposit["status"]
  sentAt: Date | null
  confirmedAt: Date | null
  rejectedAt: Date | null
  createdAt: Date
  citizen: { displayName: string }
  shop: {
    id: string
    name: string
    code: string
    area: string
  } | null
  lines: LineRow[]
}

export function pointsOfLines(lines: Array<{ quantity: number; pointsEach: number }>) {
  return lines.reduce((sum, line) => sum + line.quantity * line.pointsEach, 0)
}

export function toDirectoryDeposit(row: DepositRow): DirectoryDeposit {
  const lines = row.lines.map((line) => ({
    id: line.id,
    materialId: line.materialId,
    name: line.name,
    category: line.category,
    image: line.image,
    quantity: line.quantity,
    pointsEach: line.pointsEach,
    pointsTotal: line.quantity * line.pointsEach,
  }))
  return {
    id: row.id,
    status: row.status,
    shopId: row.shop?.id ?? null,
    shopName: row.shop?.name ?? null,
    shopCode: row.shop?.code ?? null,
    shopArea: row.shop?.area ?? null,
    citizenName: row.citizen.displayName,
    sentAt: row.sentAt?.toISOString() ?? null,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    pointsTotal: pointsOfLines(row.lines),
    lines,
  }
}
