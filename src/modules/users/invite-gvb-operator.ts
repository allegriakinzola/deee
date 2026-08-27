import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { sendInvitationEmail } from "@/modules/notify"
import { AppError, ErrorCode, isAppError } from "@/platform/errors"
import { normalizeEmail } from "@/platform/email"

import { assertCanManageUsers } from "./assert-manager"
import { GVB_INVITABLE_ROLES, type GvbInvitableRole } from "./contract"
import { provisionInvitedUser } from "./provision-invited-user"

const inviteInputSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().min(3),
  role: z.enum(GVB_INVITABLE_ROLES),
})

export type InviteGvbOperatorResult = {
  email: string
  invitationUrl: string
  expiresAt: string
  emailed: boolean
}

export async function inviteGvbOperator(
  actor: AuthUser,
  input: unknown
): Promise<InviteGvbOperatorResult> {
  assertCanManageUsers(actor)

  const parsed = inviteInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez un nom, un e-mail valide et un rôle GVB."
    )
  }

  const email = normalizeEmail(parsed.data.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Indiquez un e-mail valide.")
  }

  if (email === actor.email) {
    throw new AppError(
      ErrorCode.SELF_ACTION,
      400,
      "Vous ne pouvez pas vous inviter vous-même."
    )
  }

  const role = parsed.data.role as GvbInvitableRole
  const displayName = parsed.data.displayName
  const provisioned = await provisionInvitedUser({
    displayName,
    email,
    role,
    invitedById: actor.id,
  })

  let emailed = true
  try {
    await sendInvitationEmail({
      to: email,
      displayName,
      roleLabel:
        role === "GVB_ADMIN" ? "administrateur GVB" : "collecteur GVB",
      invitationUrl: provisioned.invitationUrl,
      invitedByName: actor.displayName,
    })
  } catch (error) {
    if (isAppError(error) && error.code === ErrorCode.MAIL_FAILED) {
      emailed = false
    } else {
      throw error
    }
  }

  return {
    email,
    invitationUrl: provisioned.invitationUrl,
    expiresAt: provisioned.expiresAt.toISOString(),
    emailed,
  }
}
