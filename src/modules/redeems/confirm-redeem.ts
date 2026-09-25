import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertShopStaff } from "./assert-shop"
import type { DirectoryRedeem } from "./contract"
import { toDirectoryRedeem } from "./present"
import { confirmRedeemRecord, findRedeemById } from "./repository"

export async function confirmShopRedeem(
  actor: AuthUser,
  redeemId: string
): Promise<DirectoryRedeem> {
  const shopId = assertShopStaff(actor)
  const existing = await findRedeemById(redeemId)
  if (!existing || existing.shop.id !== shopId || existing.status !== "SENT") {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Cette demande n’est plus en attente."
    )
  }

  const result = await confirmRedeemRecord({
    redeemId,
    shopId,
    confirmedById: actor.id,
    citizenId: existing.citizenId,
    points: existing.points,
  })

  if (result.status === "missing") {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Cette demande n’est plus en attente."
    )
  }
  if (result.status === "insufficient") {
    throw new AppError(
      ErrorCode.VALIDATION,
      409,
      "Le solde du citoyen est insuffisant pour confirmer cet échange."
    )
  }
  return toDirectoryRedeem(result.redeem)
}
