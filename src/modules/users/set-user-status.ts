import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { revokeAllSessionsForUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageUsers } from "./assert-manager"
import {
  countActiveGvbAdmins,
  findUserById,
  revokeOpenInvitations,
  updateUserStatus,
} from "./repository"

const statusInputSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
})

export async function setUserStatus(
  actor: AuthUser,
  userId: string,
  input: unknown
): Promise<{ id: string; status: "ACTIVE" | "DISABLED" }> {
  assertCanManageUsers(actor)

  const parsed = statusInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Statut invalide."
    )
  }

  if (actor.id === userId) {
    throw new AppError(
      ErrorCode.SELF_ACTION,
      400,
      "Vous ne pouvez pas modifier le statut de votre propre compte."
    )
  }

  const target = await findUserById(userId)
  if (!target) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Utilisateur introuvable.")
  }

  if (target.role === "SHOP_STAFF") {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Le compte d’un shop se gère depuis l’espace partenaire."
    )
  }

  if (target.role === "CITIZEN") {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Les comptes citoyens ne se gèrent pas depuis cet écran."
    )
  }

  if (
    parsed.data.status === "DISABLED" &&
    target.role === "GVB_ADMIN" &&
    target.status === "ACTIVE"
  ) {
    const activeAdmins = await countActiveGvbAdmins()
    if (activeAdmins <= 1) {
      throw new AppError(
        ErrorCode.LAST_ADMIN,
        409,
        "Impossible de désactiver le dernier administrateur GVB."
      )
    }
  }

  await updateUserStatus(userId, parsed.data.status)

  if (parsed.data.status === "DISABLED") {
    await revokeOpenInvitations(userId)
    await revokeAllSessionsForUser(userId)
  }

  return { id: userId, status: parsed.data.status }
}
