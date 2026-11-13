import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"
import { publishLive, shopChannel, userChannel } from "@/platform/live"

import { assertShopStaff } from "./assert-shop"
import type { DirectoryDeposit } from "./contract"
import { toDirectoryDeposit } from "./present"
import { findDepositById, rejectDepositRecord } from "./repository"

export async function rejectShopDeposit(
  actor: AuthUser,
  depositId: string
): Promise<DirectoryDeposit> {
  const shopId = assertShopStaff(actor)
  const existing = await findDepositById(depositId)
  if (!existing || existing.shop?.id !== shopId || existing.status !== "SENT") {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Cette demande n’est plus en attente."
    )
  }
  const rejected = await rejectDepositRecord(depositId)
  publishLive(
    [userChannel(existing.citizenId), shopChannel(shopId)],
    { type: "deposit.rejected", at: new Date().toISOString() }
  )
  return toDirectoryDeposit(rejected)
}
