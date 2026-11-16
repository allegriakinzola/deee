import type { PartnerKind, RedeemStatus, RewardKind } from "@/generated/prisma/client"

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
  partnerName: string | null
  citizenName: string
  sentAt: string
  confirmedAt: string | null
  rejectedAt: string | null
  createdAt: string
}

export type ShopRedeemOffer = {
  id: string
  label: string
  image: string | null
  usd: number
}

export type ShopRedeemOffers = {
  shopName: string
  shopCode: string
  partnerName: string
  partnerKind: PartnerKind
  rewardKind: RewardKind
  rewards: ShopRedeemOffer[]
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
