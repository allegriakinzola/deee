import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

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
  return toDirectoryDeposit(rejected)
}
