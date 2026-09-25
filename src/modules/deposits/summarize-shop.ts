import "server-only"

import { daysAgoUtc, utcDayKey } from "@/lib/period"

import { pointsOfLines } from "./present"
import {
  countDeposits,
  countDepositsByShop,
  listDepositsSince,
  type DepositScope,
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
  shopName: string | null
  partnerName: string | null
  status: "CONFIRMED" | "REJECTED"
  points: number
  at: string
}

export type DepositPlace = {
  id: string
  name: string
  confirmed: number
  points: number
}

export type ShopDepositSummary = {
  pending: number
  confirmed30: number
  rejected30: number
  pointsCredited30: number
  daily: ShopDepositDay[]
  topMaterials: ShopDepositMaterial[]
  recent: ShopDepositActivity[]
  byShop: DepositPlace[]
  byPartner: DepositPlace[]
  pendingByShop: Array<{ shopId: string; count: number }>
}

export async function summarizeDeposits(
  scope: DepositScope = {}
): Promise<ShopDepositSummary> {
  const since = daysAgoUtc(29)
  const [pending, rows, pendingByShop] = await Promise.all([
    countDeposits(scope, ["SENT"]),
    listDepositsSince(scope, ["CONFIRMED", "REJECTED"], since),
    countDepositsByShop(scope, ["SENT"]),
  ])

  const dailyMap = new Map<string, ShopDepositDay>()
  const materials = new Map<string, ShopDepositMaterial>()
  const shops = new Map<string, DepositPlace>()
  const partners = new Map<string, DepositPlace>()
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
      if (row.shop) {
        const shop = shops.get(row.shop.id) ?? {
          id: row.shop.id,
          name: row.shop.name,
          confirmed: 0,
          points: 0,
        }
        shop.confirmed += 1
        shop.points += points
        shops.set(row.shop.id, shop)
        const partner = partners.get(row.shop.partner.id) ?? {
          id: row.shop.partner.id,
          name: row.shop.partner.name,
          confirmed: 0,
          points: 0,
        }
        partner.confirmed += 1
        partner.points += points
        partners.set(row.shop.partner.id, partner)
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
      shopName: row.shop?.name ?? null,
      partnerName: row.shop?.partner.name ?? null,
      status: row.status === "CONFIRMED" ? "CONFIRMED" : "REJECTED",
      points: pointsOfLines(row.lines),
      at: (row.confirmedAt ?? row.rejectedAt ?? row.updatedAt).toISOString(),
    })),
    byShop: [...shops.values()].sort((a, b) => b.confirmed - a.confirmed),
    byPartner: [...partners.values()].sort((a, b) => b.confirmed - a.confirmed),
    pendingByShop: pendingByShop.flatMap((item) =>
      item.shopId ? [{ shopId: item.shopId, count: item._count._all }] : []
    ),
  }
}

export async function summarizeShopDeposits(
  shopId: string
): Promise<ShopDepositSummary> {
  return summarizeDeposits({ shopId })
}
