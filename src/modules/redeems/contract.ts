import type { PartnerKind, RedeemStatus } from "@/generated/prisma/client"
import type { RedeemReward } from "@/lib/redeem-rewards"

export type DirectoryRedeem = {
  id: string
  status: RedeemStatus
  bons: number
  points: number
  rewardId: string
  rewardLabel: string
  partnerKind: PartnerKind
  usdValue: string
  shopId: string
  shopName: string
  shopCode: string
  shopArea: string
  citizenName: string
  sentAt: string
  confirmedAt: string | null
  rejectedAt: string | null
  createdAt: string
}

export type ShopRedeemOffers = {
  shopName: string
  shopCode: string
  partnerName: string
  partnerKind: PartnerKind
  rewards: RedeemReward[]
}

export type CitizenRedeemQuote = {
  points: number
  pendingPoints: number
  availablePoints: number
  bonsAvailable: number
  pointsPerBon: number
  bonUsdValue: string
  usdPerPoint: string
}
