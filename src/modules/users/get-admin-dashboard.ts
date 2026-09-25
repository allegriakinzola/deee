import "server-only"

import { mergeDailySeries, mergeRecent } from "@/lib/dashboard"
import { canAccessGvbAdmin } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { summarizeDeposits } from "@/modules/deposits"
import { countDirectoryMaterials } from "@/modules/materials"
import { countDirectoryPartners } from "@/modules/partners"
import { summarizeRedeems } from "@/modules/redeems"
import { countDirectoryShops } from "@/modules/shops"
import { AppError, ErrorCode } from "@/platform/errors"

import { countUsersByRole } from "./repository"

export type AdminDashboard = {
  partners: number
  partnersActive: number
  shops: number
  shopsActive: number
  citizens: number
  shopStaff: number
  partnerAdmins: number
  materials: number
  pendingDeposits: number
  pendingRedeems: number
  confirmedDeposits30: number
  pointsCredited30: number
  confirmedRedeems30: number
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
  topShops: Array<{
    name: string
    deposits: number
    redeems: number
    points: number
  }>
  topPartners: Array<{
    name: string
    deposits: number
    redeems: number
    usd: string
  }>
  topMaterials: Array<{ name: string; quantity: number; points: number }>
  rewards: Array<{ label: string; count: number; bons: number; usd: string }>
  recent: Array<{
    id: string
    kind: "deposit" | "redeem"
    citizenName: string
    shopName: string | null
    partnerName: string | null
    title: string
    status: "CONFIRMED" | "REJECTED"
    points: number
    at: string
  }>
}

export async function getAdminDashboard(
  actor: AuthUser
): Promise<AdminDashboard> {
  if (!canAccessGvbAdmin(actor.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace opérateur uniquement.")
  }

  const [
    deposits,
    redeems,
    partners,
    partnersActive,
    shops,
    shopsActive,
    materials,
    roles,
  ] = await Promise.all([
    summarizeDeposits(),
    summarizeRedeems(),
    countDirectoryPartners(),
    countDirectoryPartners("ACTIVE"),
    countDirectoryShops(),
    countDirectoryShops({ status: "ACTIVE" }),
    countDirectoryMaterials("ACTIVE"),
    countUsersByRole(),
  ])

  const redeemByShop = new Map(redeems.byShop.map((item) => [item.id, item]))
  const redeemByPartner = new Map(
    redeems.byPartner.map((item) => [item.id, item])
  )

  return {
    partners,
    partnersActive,
    shops,
    shopsActive,
    citizens: roles.CITIZEN ?? 0,
    shopStaff: roles.SHOP_STAFF ?? 0,
    partnerAdmins: roles.PARTNER_ADMIN ?? 0,
    materials,
    pendingDeposits: deposits.pending,
    pendingRedeems: redeems.pending,
    confirmedDeposits30: deposits.confirmed30,
    pointsCredited30: deposits.pointsCredited30,
    confirmedRedeems30: redeems.confirmed30,
    bons30: redeems.bons30,
    usd30: redeems.usd30.toFixed(2),
    daily: mergeDailySeries(deposits.daily, redeems.daily),
    topShops: deposits.byShop.slice(0, 6).map((shop) => ({
      name: shop.name,
      deposits: shop.confirmed,
      redeems: redeemByShop.get(shop.id)?.confirmed ?? 0,
      points: shop.points,
    })),
    topPartners: deposits.byPartner.slice(0, 6).map((partner) => ({
      name: partner.name,
      deposits: partner.confirmed,
      redeems: redeemByPartner.get(partner.id)?.confirmed ?? 0,
      usd: (redeemByPartner.get(partner.id)?.usd ?? 0).toFixed(2),
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
        partnerName: item.partnerName,
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
        partnerName: item.partnerName,
        title: item.rewardLabel,
        status: item.status,
        points: item.points,
        at: item.at,
      })),
    ]),
  }
}
