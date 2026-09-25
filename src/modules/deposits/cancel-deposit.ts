import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCitizen } from "./assert-citizen"
import { deleteCitizenDepositRecord, findDepositById } from "./repository"

export async function cancelCitizenDeposit(
  actor: AuthUser,
  depositId: string
): Promise<{ id: string }> {
  assertCitizen(actor)
  const existing = await findDepositById(depositId)
  if (!existing || existing.citizenId !== actor.id) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce dépôt n’existe pas.")
  }
  if (existing.status === "CONFIRMED") {
    throw new AppError(
      ErrorCode.VALIDATION,
      409,
      "Ce dépôt a déjà été confirmé par le shop."
    )
  }
  if (existing.status !== "DRAFT" && existing.status !== "SENT") {
    throw new AppError(
      ErrorCode.VALIDATION,
      409,
      "Ce dépôt ne peut plus être supprimé."
    )
  }

  const deleted = await deleteCitizenDepositRecord({
    depositId,
    citizenId: actor.id,
  })
  if (!deleted) {
    throw new AppError(
      ErrorCode.VALIDATION,
      409,
      "Ce dépôt ne peut plus être supprimé."
    )
  }
  return { id: depositId }
}
