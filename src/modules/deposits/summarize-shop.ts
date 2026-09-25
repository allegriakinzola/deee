import "server-only"

import { daysAgoUtc, utcDayKey } from "@/lib/period"

import { pointsOfLines } from "./present"
import {
  countShopDeposits,
  listShopDepositsSince,
} from "./repository"

export type ShopDepositDay = {
  date: string
  confirmed: number
  points: number
}

export type ShopDepositMaterial = {
  name: string
  quantity: number
  points: number
}

export type ShopDepositActivity = {
  id: string
  citizenName: string
  status: "CONFIRMED" | "REJECTED"
  points: number
  at: string
}

export type ShopDepositSummary = {
  pending: number
  confirmed30: number
  rejected30: number
  pointsCredited30: number
  daily: ShopDepositDay[]
  topMaterials: ShopDepositMaterial[]
  recent: ShopDepositActivity[]
}

export async function summarizeShopDeposits(
  shopId: string
): Promise<ShopDepositSummary> {
  const since = daysAgoUtc(29)
  const [pending, rows] = await Promise.all([
    countShopDeposits(shopId, ["SENT"]),
    listShopDepositsSince(shopId, ["CONFIRMED", "REJECTED"], since),
  ])

  const dailyMap = new Map<string, ShopDepositDay>()
  const materials = new Map<string, ShopDepositMaterial>()
  let confirmed30 = 0
  let rejected30 = 0
  let pointsCredited30 = 0

  for (const row of rows) {
    const points = pointsOfLines(row.lines)
    if (row.status === "CONFIRMED" && row.confirmedAt) {
      confirmed30 += 1
      pointsCredited30 += points
      const key = utcDayKey(row.confirmedAt)
      const current = dailyMap.get(key) ?? {
        date: key,
        confirmed: 0,
        points: 0,
      }
      current.confirmed += 1
      current.points += points
      dailyMap.set(key, current)
      for (const line of row.lines) {
        const item = materials.get(line.name) ?? {
          name: line.name,
          quantity: 0,
          points: 0,
        }
        item.quantity += line.quantity
        item.points += line.quantity * line.pointsEach
        materials.set(line.name, item)
      }
    }
    if (row.status === "REJECTED") {
      rejected30 += 1
    }
  }

  return {
    pending,
    confirmed30,
    rejected30,
    pointsCredited30,
    daily: [...dailyMap.values()],
    topMaterials: [...materials.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6),
    recent: rows.slice(0, 8).map((row) => ({
      id: row.id,
      citizenName: row.citizen.displayName,
      status: row.status === "CONFIRMED" ? "CONFIRMED" : "REJECTED",
      points: pointsOfLines(row.lines),
      at: (row.confirmedAt ?? row.rejectedAt ?? row.updatedAt).toISOString(),
    })),
  }
}
