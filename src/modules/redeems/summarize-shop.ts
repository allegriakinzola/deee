import "server-only"

import { daysAgoUtc, utcDayKey } from "@/lib/period"

import {
  countRedeems,
  countRedeemsByShop,
  listRedeemsSince,
  type RedeemScope,
} from "./repository"

export type ShopRedeemDay = {
  date: string
  confirmed: number
  points: number
}

export type ShopRedeemReward = {
  label: string
  count: number
  bons: number
  usd: number
}

export type ShopRedeemActivity = {
  id: string
  citizenName: string
  shopName: string | null
  partnerName: string | null
  status: "CONFIRMED" | "REJECTED"
  rewardLabel: string
  points: number
  at: string
}

export type RedeemPlace = {
  id: string
  name: string
  confirmed: number
  points: number
  bons: number
  usd: number
}

export type ShopRedeemSummary = {
  pending: number
  confirmed30: number
  rejected30: number
  pointsDebited30: number
  bons30: number
  usd30: number
  daily: ShopRedeemDay[]
  rewards: ShopRedeemReward[]
  recent: ShopRedeemActivity[]
  byShop: RedeemPlace[]
  byPartner: RedeemPlace[]
  pendingByShop: Array<{ shopId: string; count: number }>
}

export async function summarizeRedeems(
  scope: RedeemScope = {}
): Promise<ShopRedeemSummary> {
  const since = daysAgoUtc(29)
  const [pending, rows, pendingByShop] = await Promise.all([
    countRedeems(scope, ["SENT"]),
    listRedeemsSince(scope, ["CONFIRMED", "REJECTED"], since),
    countRedeemsByShop(scope, ["SENT"]),
  ])

  const dailyMap = new Map<string, ShopRedeemDay>()
  const rewards = new Map<string, ShopRedeemReward>()
  const shops = new Map<string, RedeemPlace>()
  const partners = new Map<string, RedeemPlace>()
  let confirmed30 = 0
  let rejected30 = 0
  let pointsDebited30 = 0
  let bons30 = 0
  let usd30 = 0

  for (const row of rows) {
    if (row.status === "CONFIRMED" && row.confirmedAt) {
      const usd = Number(row.usdValue)
      const safeUsd = Number.isFinite(usd) ? usd : 0
      confirmed30 += 1
      pointsDebited30 += row.points
      bons30 += row.bons
      usd30 += safeUsd
      const key = utcDayKey(row.confirmedAt)
      const current = dailyMap.get(key) ?? {
        date: key,
        confirmed: 0,
        points: 0,
      }
      current.confirmed += 1
      current.points += row.points
      dailyMap.set(key, current)
      const reward = rewards.get(row.rewardLabel) ?? {
        label: row.rewardLabel,
        count: 0,
        bons: 0,
        usd: 0,
      }
      reward.count += 1
      reward.bons += row.bons
      reward.usd += safeUsd
      rewards.set(row.rewardLabel, reward)

      const shop = shops.get(row.shop.id) ?? {
        id: row.shop.id,
        name: row.shop.name,
        confirmed: 0,
        points: 0,
        bons: 0,
        usd: 0,
      }
      shop.confirmed += 1
      shop.points += row.points
      shop.bons += row.bons
      shop.usd += safeUsd
      shops.set(row.shop.id, shop)

      const partner = partners.get(row.shop.partner.id) ?? {
        id: row.shop.partner.id,
        name: row.shop.partner.name,
        confirmed: 0,
        points: 0,
        bons: 0,
        usd: 0,
      }
      partner.confirmed += 1
      partner.points += row.points
      partner.bons += row.bons
      partner.usd += safeUsd
      partners.set(row.shop.partner.id, partner)
    }
    if (row.status === "REJECTED") {
      rejected30 += 1
    }
  }

  return {
    pending,
    confirmed30,
    rejected30,
    pointsDebited30,
    bons30,
    usd30,
    daily: [...dailyMap.values()],
    rewards: [...rewards.values()].sort((a, b) => b.count - a.count),
    recent: rows.slice(0, 8).map((row) => ({
      id: row.id,
      citizenName: row.citizen.displayName,
      shopName: row.shop.name,
      partnerName: row.shop.partner.name,
      status: row.status === "CONFIRMED" ? "CONFIRMED" : "REJECTED",
      rewardLabel: row.rewardLabel,
      points: row.points,
      at: (row.confirmedAt ?? row.rejectedAt ?? row.updatedAt).toISOString(),
    })),
    byShop: [...shops.values()].sort((a, b) => b.confirmed - a.confirmed),
    byPartner: [...partners.values()].sort((a, b) => b.confirmed - a.confirmed),
    pendingByShop: pendingByShop.map((item) => ({
      shopId: item.shopId,
      count: item._count._all,
    })),
  }
}

export async function summarizeShopRedeems(
  shopId: string
): Promise<ShopRedeemSummary> {
  return summarizeRedeems({ shopId })
}
