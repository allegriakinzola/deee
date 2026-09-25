import "server-only"

import { z } from "zod"

import { findReward } from "@/lib/redeem-rewards"
import { normalizeShopCode } from "@/lib/shop-code"
import type { AuthUser } from "@/modules/auth"
import { findActiveShopByCode } from "@/modules/shops"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCitizen } from "./assert-citizen"
import type { DirectoryRedeem } from "./contract"
import { getCitizenRedeemQuote } from "./get-quote"
import { toDirectoryRedeem } from "./present"
import { createSentRedeemRecord } from "./repository"

const inputSchema = z.object({
  shopCode: z.string().trim().min(4).max(12),
  bons: z.coerce.number().int().min(1).max(99),
  rewardId: z.string().trim().min(1),
})

export async function sendCitizenRedeem(
  actor: AuthUser,
  input: unknown
): Promise<DirectoryRedeem> {
  assertCitizen(actor)
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez le code du shop, un objet d’échange et un nombre de bons."
    )
  }

  const quote = await getCitizenRedeemQuote(actor)
  if (quote.pointsPerBon < 1) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Le barème des bons n’est pas utilisable pour le moment."
    )
  }
  if (parsed.data.bons > quote.bonsAvailable) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      quote.bonsAvailable < 1
        ? `Il faut au moins ${quote.pointsPerBon} points (1 bon = ${quote.bonUsdValue} USD) pour échanger.`
        : `Vous pouvez échanger au plus ${quote.bonsAvailable} bon${quote.bonsAvailable === 1 ? "" : "s"} pour l’instant.`
    )
  }

  const shop = await findActiveShopByCode(
    normalizeShopCode(parsed.data.shopCode)
  )
  if (!shop) {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Aucun shop actif ne correspond à ce code."
    )
  }

  const reward = findReward(parsed.data.rewardId)
  if (!reward || reward.partnerKind !== shop.partner.kind) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Choisissez un objet d’échange proposé par ce shop."
    )
  }

  const created = await createSentRedeemRecord({
    citizenId: actor.id,
    shopId: shop.id,
    bons: parsed.data.bons,
    points: parsed.data.bons * quote.pointsPerBon,
    rewardId: reward.id,
    rewardLabel: reward.label,
    partnerKind: reward.partnerKind,
    usdValue: String(reward.usd * parsed.data.bons),
  })
  if (!created) {
    throw new AppError(
      ErrorCode.VALIDATION,
      409,
      "Vos points disponibles ont changé. Actualisez et réessayez."
    )
  }
  return toDirectoryRedeem(created)
}
