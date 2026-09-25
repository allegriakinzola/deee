import "server-only"

import { daysAgoUtc, utcDayKey } from "@/lib/period"

import {
  countShopRedeems,
  listShopRedeemsSince,
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
  status: "CONFIRMED" | "REJECTED"
  rewardLabel: string
  points: number
  at: string
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
}

export async function summarizeShopRedeems(
  shopId: string
): Promise<ShopRedeemSummary> {
  const since = daysAgoUtc(29)
  const [pending, rows] = await Promise.all([
    countShopRedeems(shopId, ["SENT"]),
    listShopRedeemsSince(shopId, ["CONFIRMED", "REJECTED"], since),
  ])

  const dailyMap = new Map<string, ShopRedeemDay>()
  const rewards = new Map<string, ShopRedeemReward>()
  let confirmed30 = 0
  let rejected30 = 0
  let pointsDebited30 = 0
  let bons30 = 0
  let usd30 = 0

  for (const row of rows) {
    if (row.status === "CONFIRMED" && row.confirmedAt) {
      const usd = Number(row.usdValue)
      confirmed30 += 1
      pointsDebited30 += row.points
      bons30 += row.bons
      usd30 += Number.isFinite(usd) ? usd : 0
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
      reward.usd += Number.isFinite(usd) ? usd : 0
      rewards.set(row.rewardLabel, reward)
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
      status: row.status === "CONFIRMED" ? "CONFIRMED" : "REJECTED",
      rewardLabel: row.rewardLabel,
      points: row.points,
      at: (row.confirmedAt ?? row.rejectedAt ?? row.updatedAt).toISOString(),
    })),
  }
}
