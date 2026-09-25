import "server-only"

import { mergeDailySeries, mergeRecent } from "@/lib/dashboard"
import { canAccessShopSpace } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { summarizeShopDeposits } from "@/modules/deposits"
import { summarizeShopRedeems } from "@/modules/redeems"
import { AppError, ErrorCode } from "@/platform/errors"

export type ShopDashboardDay = {
  date: string
  label: string
  deposits: number
  redeems: number
  pointsIn: number
  pointsOut: number
}

export type ShopDashboard = {
  pendingDeposits: number
  pendingRedeems: number
  confirmedDeposits30: number
  rejectedDeposits30: number
  pointsCredited30: number
  confirmedRedeems30: number
  rejectedRedeems30: number
  pointsDebited30: number
  bons30: number
  usd30: string
  daily: ShopDashboardDay[]
  topMaterials: Array<{ name: string; quantity: number; points: number }>
  rewards: Array<{
    label: string
    count: number
    bons: number
    usd: string
  }>
  recent: Array<{
    id: string
    kind: "deposit" | "redeem"
    citizenName: string
    title: string
    status: "CONFIRMED" | "REJECTED"
    points: number
    at: string
  }>
}

export async function getShopDashboard(
  actor: AuthUser
): Promise<ShopDashboard> {
  if (!canAccessShopSpace(actor.role, actor.shopId) || !actor.shopId) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace shop uniquement.")
  }
  const shopId = actor.shopId

  const [deposits, redeems] = await Promise.all([
    summarizeShopDeposits(shopId),
    summarizeShopRedeems(shopId),
  ])

  const recent = mergeRecent([
    ...deposits.recent.map((item) => ({
      id: `deposit-${item.id}`,
      kind: "deposit" as const,
      citizenName: item.citizenName,
      title: "Dépôt",
      status: item.status,
      points: item.points,
      at: item.at,
    })),
    ...redeems.recent.map((item) => ({
      id: `redeem-${item.id}`,
      kind: "redeem" as const,
      citizenName: item.citizenName,
      title: item.rewardLabel,
      status: item.status,
      points: item.points,
      at: item.at,
    })),
  ])

  return {
    pendingDeposits: deposits.pending,
    pendingRedeems: redeems.pending,
    confirmedDeposits30: deposits.confirmed30,
    rejectedDeposits30: deposits.rejected30,
    pointsCredited30: deposits.pointsCredited30,
    confirmedRedeems30: redeems.confirmed30,
    rejectedRedeems30: redeems.rejected30,
    pointsDebited30: redeems.pointsDebited30,
    bons30: redeems.bons30,
    usd30: redeems.usd30.toFixed(2),
    daily: mergeDailySeries(deposits.daily, redeems.daily),
    topMaterials: deposits.topMaterials,
    rewards: redeems.rewards.map((item) => ({
      label: item.label,
      count: item.count,
      bons: item.bons,
      usd: item.usd.toFixed(2),
    })),
    recent,
  }
}
