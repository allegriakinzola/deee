import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManagePartnerMembers } from "./assert-member-manager"
import {
  countPartnerMembersExcluding,
  findMemberInPartner,
  reassignAndDeleteMember,
} from "./repository"

export async function deletePartnerMember(
  actor: AuthUser,
  partnerId: string,
  userId: string
): Promise<{ id: string }> {
  assertCanManagePartnerMembers(actor, partnerId)

  if (actor.id === userId) {
    throw new AppError(
      ErrorCode.SELF_ACTION,
      400,
      "Vous ne pouvez pas supprimer votre propre compte."
    )
  }

  const membership = await findMemberInPartner(partnerId, userId)
  if (!membership || membership.user.role !== "PARTNER_ADMIN") {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Cet utilisateur n’appartient pas à votre entreprise."
    )
  }

  const remaining = await countPartnerMembersExcluding(partnerId, userId)
  if (remaining < 1) {
    throw new AppError(
      ErrorCode.LAST_ADMIN,
      409,
      "Impossible de supprimer le dernier administrateur de l’entreprise."
    )
  }

  await reassignAndDeleteMember({ userId, successorId: actor.id })
  return { id: userId }
}
