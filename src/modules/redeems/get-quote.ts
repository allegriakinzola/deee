import "server-only"

import {
  DEFAULT_USD_PER_POINT,
  bonsFromPoints,
  pointsPerBon,
} from "@/modules/catalog"
import type { AuthUser } from "@/modules/auth"
import { getCitizenBalance } from "@/modules/ledger"
import { readBonUsdValue } from "@/modules/settings"

import { assertCitizen } from "./assert-citizen"
import type { CitizenRedeemQuote } from "./contract"
import { sumPendingRedeemPoints } from "./repository"

export async function getCitizenRedeemQuote(
  actor: AuthUser
): Promise<CitizenRedeemQuote> {
  assertCitizen(actor)

  const [balance, pendingPoints, bonUsdValue] = await Promise.all([
    getCitizenBalance(actor),
    sumPendingRedeemPoints(actor.id),
    readBonUsdValue(),
  ])

  const availablePoints = Math.max(0, balance.points - pendingPoints)
  const perBon = pointsPerBon(DEFAULT_USD_PER_POINT, bonUsdValue)

  return {
    points: balance.points,
    pendingPoints,
    availablePoints,
    bonsAvailable: bonsFromPoints(
      availablePoints,
      DEFAULT_USD_PER_POINT,
      bonUsdValue
    ),
    pointsPerBon: perBon,
    bonUsdValue,
    usdPerPoint: DEFAULT_USD_PER_POINT,
  }
}
