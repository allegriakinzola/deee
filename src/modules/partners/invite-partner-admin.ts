import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { sendInvitationEmail } from "@/modules/notify"
import { provisionInvitedUser } from "@/modules/users"
import { AppError, ErrorCode, isAppError } from "@/platform/errors"
import { normalizeEmail } from "@/platform/email"

import { assertCanManagePartnerMembers } from "./assert-member-manager"
import type { PartnerInvitationResult } from "./contract"
import {
  ensurePartnerMembership,
  findPartnerById,
  findUserByEmailWithMemberships,
  listMembershipsForUser,
} from "./repository"

const inviteInputSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().min(3),
})

export async function invitePartnerAdmin(
  actor: AuthUser,
  partnerId: string,
  input: unknown
): Promise<PartnerInvitationResult> {
  assertCanManagePartnerMembers(actor, partnerId)

  const partner = await findPartnerById(partnerId)
  if (!partner) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce partenaire n’existe pas.")
  }

  const parsed = inviteInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez le nom et l’e-mail de l’administrateur."
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

  const existing = await findUserByEmailWithMemberships(email)
  if (
    existing?.partnerMemberships.some((item) => item.partnerId !== partner.id)
  ) {
    throw new AppError(
      ErrorCode.EMAIL_TAKEN,
      409,
      "Cet e-mail est déjà administrateur d’un autre partenaire."
    )
  }

  const displayName = parsed.data.displayName
  const provisioned = await provisionInvitedUser({
    displayName,
    email,
    role: "PARTNER_ADMIN",
    invitedById: actor.id,
  })

  const memberships = await listMembershipsForUser(provisioned.userId)
  if (memberships.some((item) => item.partnerId !== partner.id)) {
    throw new AppError(
      ErrorCode.EMAIL_TAKEN,
      409,
      "Cet e-mail est déjà administrateur d’un autre partenaire."
    )
  }

  await ensurePartnerMembership({
    partnerId: partner.id,
    userId: provisioned.userId,
  })

  let emailed = true
  try {
    await sendInvitationEmail({
      to: email,
      displayName,
      roleLabel: `administrateur ${partner.shortName}`,
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
