import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageUsers } from "./assert-manager"
import {
  countGvbAdminsExcluding,
  findUserById,
  reassignAndDeleteUser,
} from "./repository"

export async function deleteDirectoryUser(
  actor: AuthUser,
  userId: string
): Promise<{ id: string }> {
  assertCanManageUsers(actor)

  if (actor.id === userId) {
    throw new AppError(
      ErrorCode.SELF_ACTION,
      400,
      "Vous ne pouvez pas supprimer votre propre compte."
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

  if (target.role === "GVB_ADMIN") {
    const remainingAdmins = await countGvbAdminsExcluding(userId)
    if (remainingAdmins < 1) {
      throw new AppError(
        ErrorCode.LAST_ADMIN,
        409,
        "Impossible de supprimer le dernier administrateur GVB."
      )
    }
  }

  await reassignAndDeleteUser({ userId, successorId: actor.id })
  return { id: userId }
}
