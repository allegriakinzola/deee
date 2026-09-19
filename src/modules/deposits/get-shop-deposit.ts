import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertShopStaff } from "./assert-shop"
import type { DirectoryDeposit } from "./contract"
import { toDirectoryDeposit } from "./present"
import { findDepositById } from "./repository"

export async function getShopDeposit(
  actor: AuthUser,
  depositId: string
): Promise<DirectoryDeposit> {
  const shopId = assertShopStaff(actor)
  const deposit = await findDepositById(depositId)
  if (!deposit || deposit.shop?.id !== shopId) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce dépôt n’existe pas.")
  }
  return toDirectoryDeposit(deposit)
}
