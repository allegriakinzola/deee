import "server-only"

import { z } from "zod"

import { revokeAllSessionsForUser, type AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManagePartnerMembers } from "./assert-member-manager"
import {
  countActivePartnerAdmins,
  findMemberInPartner,
  revokeMemberInvitations,
  updateMemberUserStatus,
} from "./repository"

const statusInputSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
})

export async function setPartnerMemberStatus(
  actor: AuthUser,
  partnerId: string,
  userId: string,
  input: unknown
): Promise<{ id: string; status: "ACTIVE" | "DISABLED" }> {
  assertCanManagePartnerMembers(actor, partnerId)

  const parsed = statusInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Statut invalide.")
  }

  if (actor.id === userId) {
    throw new AppError(
      ErrorCode.SELF_ACTION,
      400,
      "Vous ne pouvez pas modifier le statut de votre propre compte."
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

  if (
    parsed.data.status === "DISABLED" &&
    membership.user.status === "ACTIVE"
  ) {
    const activeAdmins = await countActivePartnerAdmins(partnerId)
    if (activeAdmins <= 1) {
      throw new AppError(
        ErrorCode.LAST_ADMIN,
        409,
        "Impossible de désactiver le dernier administrateur de l’entreprise."
      )
    }
  }

  await updateMemberUserStatus(userId, parsed.data.status)

  if (parsed.data.status === "DISABLED") {
    await revokeMemberInvitations(userId)
    await revokeAllSessionsForUser(userId)
  }

  return { id: userId, status: parsed.data.status }
}
