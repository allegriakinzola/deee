import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertShopStaff } from "./assert-shop"
import type { DirectoryRedeem } from "./contract"
import { toDirectoryRedeem } from "./present"
import { findRedeemById, rejectRedeemRecord } from "./repository"

export async function rejectShopRedeem(
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
  const rejected = await rejectRedeemRecord(redeemId)
  return toDirectoryRedeem(rejected)
}
