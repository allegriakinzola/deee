import "server-only"

import { mergeDailySeries, mergeRecent } from "@/lib/dashboard"
import { canAccessCitizenSpace } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { getCitizenBalance } from "@/modules/ledger"
import { getCitizenRedeemQuote, summarizeRedeems } from "@/modules/redeems"
import { AppError, ErrorCode } from "@/platform/errors"

import { summarizeDeposits } from "./summarize-shop"

export type CitizenDashboard = {
  points: number
  availablePoints: number
  bonsAvailable: number
  pointsPerBon: number
  lastDeposit: {
    shopName: string
    points: number
    confirmedAt: string
  } | null
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
  topMaterials: Array<{ name: string; quantity: number; points: number }>
  rewards: Array<{ label: string; count: number; bons: number; usd: string }>
  recent: Array<{
    id: string
    kind: "deposit" | "redeem"
    title: string
    shopName: string | null
    status: "CONFIRMED" | "REJECTED"
    points: number
    at: string
  }>
}

export async function getCitizenDashboard(
  actor: AuthUser
): Promise<CitizenDashboard> {
  if (!canAccessCitizenSpace(actor.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace citoyen uniquement.")
  }

  const [balance, quote, deposits, redeems] = await Promise.all([
    getCitizenBalance(actor),
    getCitizenRedeemQuote(actor),
    summarizeDeposits({ citizenId: actor.id }),
    summarizeRedeems({ citizenId: actor.id }),
  ])

  return {
    points: balance.points,
    availablePoints: quote.availablePoints,
    bonsAvailable: quote.bonsAvailable,
    pointsPerBon: quote.pointsPerBon,
    lastDeposit: balance.lastDeposit,
    pendingDeposits: deposits.pending,
    pendingRedeems: redeems.pending,
    confirmedDeposits30: deposits.confirmed30,
    pointsCredited30: deposits.pointsCredited30,
    confirmedRedeems30: redeems.confirmed30,
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
    recent: mergeRecent([
      ...deposits.recent.map((item) => ({
        id: `deposit-${item.id}`,
        kind: "deposit" as const,
        title: "Dépôt",
        shopName: item.shopName,
        status: item.status,
        points: item.points,
        at: item.at,
      })),
      ...redeems.recent.map((item) => ({
        id: `redeem-${item.id}`,
        kind: "redeem" as const,
        title: item.rewardLabel,
        shopName: item.shopName,
        status: item.status,
        points: item.points,
        at: item.at,
      })),
    ]),
  }
}
