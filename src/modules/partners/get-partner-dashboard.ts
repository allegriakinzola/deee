import "server-only"

import { mergeDailySeries, mergeRecent } from "@/lib/dashboard"
import { canAccessPartnerAdmin } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { summarizeDeposits } from "@/modules/deposits"
import { summarizeRedeems } from "@/modules/redeems"
import { countDirectoryShops, listPartnerShops } from "@/modules/shops"
import { AppError, ErrorCode } from "@/platform/errors"

import { countDirectoryPartnerMembers } from "./count-partners"

export type PartnerDashboard = {
  shops: number
  shopsActive: number
  members: number
  pendingDeposits: number
  pendingRedeems: number
  confirmedDeposits30: number
  rejectedDeposits30: number
  pointsCredited30: number
  confirmedRedeems30: number
  rejectedRedeems30: number
  bons30: number
  usd30: string
  daily: Array<{
    date: string
    label: string
    deposits: number
    redeems: number
    pointsIn: number
    pointsOut: number
  }>
  shopRows: Array<{
    id: string
    name: string
    area: string
    status: "ACTIVE" | "DISABLED"
    pendingDeposits: number
    pendingRedeems: number
    deposits30: number
    redeems30: number
  }>
  topMaterials: Array<{ name: string; quantity: number; points: number }>
  rewards: Array<{ label: string; count: number; bons: number; usd: string }>
  recent: Array<{
    id: string
    kind: "deposit" | "redeem"
    citizenName: string
    shopName: string | null
    title: string
    status: "CONFIRMED" | "REJECTED"
    points: number
    at: string
  }>
}

export async function getPartnerDashboard(
  actor: AuthUser
): Promise<PartnerDashboard> {
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId) || !actor.partnerId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Espace partenaire uniquement."
    )
  }
  const partnerId = actor.partnerId

  const [deposits, redeems, shops, shopsActive, members, directory] =
    await Promise.all([
      summarizeDeposits({ partnerId }),
      summarizeRedeems({ partnerId }),
      countDirectoryShops({ partnerId }),
      countDirectoryShops({ partnerId, status: "ACTIVE" }),
      countDirectoryPartnerMembers(partnerId),
      listPartnerShops(actor),
    ])

  const depositPending = new Map(
    deposits.pendingByShop.map((item) => [item.shopId, item.count])
  )
  const redeemPending = new Map(
    redeems.pendingByShop.map((item) => [item.shopId, item.count])
  )
  const depositByShop = new Map(deposits.byShop.map((item) => [item.id, item]))
  const redeemByShop = new Map(redeems.byShop.map((item) => [item.id, item]))

  return {
    shops,
    shopsActive,
    members,
    pendingDeposits: deposits.pending,
    pendingRedeems: redeems.pending,
    confirmedDeposits30: deposits.confirmed30,
    rejectedDeposits30: deposits.rejected30,
    pointsCredited30: deposits.pointsCredited30,
    confirmedRedeems30: redeems.confirmed30,
    rejectedRedeems30: redeems.rejected30,
    bons30: redeems.bons30,
    usd30: redeems.usd30.toFixed(2),
    daily: mergeDailySeries(deposits.daily, redeems.daily),
    shopRows: directory.map((shop) => ({
      id: shop.id,
      name: shop.name,
      area: shop.area,
      status: shop.status,
      pendingDeposits: depositPending.get(shop.id) ?? 0,
      pendingRedeems: redeemPending.get(shop.id) ?? 0,
      deposits30: depositByShop.get(shop.id)?.confirmed ?? 0,
      redeems30: redeemByShop.get(shop.id)?.confirmed ?? 0,
    })),
    topMaterials: deposits.topMaterials,
    rewards: redeems.rewards.map((item) => ({
      label: item.label,
      count: item.count,
      bons: item.bons,
      usd: item.usd.toFixed(2),
    })),
    recent: mergeRecent([
      ...deposits.recent.map((item) => ({
        id: `deposit-${item.id}`,
        kind: "deposit" as const,
        citizenName: item.citizenName,
        shopName: item.shopName,
        title: "Dépôt",
        status: item.status,
        points: item.points,
        at: item.at,
      })),
      ...redeems.recent.map((item) => ({
        id: `redeem-${item.id}`,
        kind: "redeem" as const,
        citizenName: item.citizenName,
        shopName: item.shopName,
        title: item.rewardLabel,
        status: item.status,
        points: item.points,
        at: item.at,
      })),
    ]),
  }
}
