import type { DirectoryRedeem } from "./contract"

type RedeemRow = {
  id: string
  status: DirectoryRedeem["status"]
  bons: number
  points: number
  rewardId: string
  rewardLabel: string
  partnerKind: DirectoryRedeem["partnerKind"]
  usdValue: { toString(): string }
  sentAt: Date
  confirmedAt: Date | null
  rejectedAt: Date | null
  createdAt: Date
  citizen: { displayName: string }
  shop: {
    id: string
    name: string
    code: string
    area: string
  }
}

export function toDirectoryRedeem(row: RedeemRow): DirectoryRedeem {
  return {
    id: row.id,
    status: row.status,
    bons: row.bons,
    points: row.points,
    rewardId: row.rewardId,
    rewardLabel: row.rewardLabel,
    partnerKind: row.partnerKind,
    usdValue: row.usdValue.toString(),
    shopId: row.shop.id,
    shopName: row.shop.name,
    shopCode: row.shop.code,
    shopArea: row.shop.area,
    citizenName: row.citizen.displayName,
    sentAt: row.sentAt.toISOString(),
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    rejectedAt: row.rejectedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}
