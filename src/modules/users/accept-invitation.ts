import "server-only"

import { z } from "zod"

import { homePathFor } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { sha256 } from "@/platform/crypto"
import { AppError, ErrorCode } from "@/platform/errors"
import { hashPassword } from "@/platform/password"
import { absoluteUrl } from "@/platform/site-url"

import { MIN_PASSWORD_LENGTH } from "./constants"
import { acceptInvitationRecord, findInvitationByTokenHash } from "./repository"

const acceptInputSchema = z
  .object({
    token: z.string().min(16),
    displayName: z.string().trim().min(2).max(80),
    password: z.string().min(MIN_PASSWORD_LENGTH),
    passwordConfirm: z.string().min(MIN_PASSWORD_LENGTH),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["passwordConfirm"],
  })

export type AcceptInvitationResult = {
  user: AuthUser
  redirectTo: string
}

export async function acceptInvitation(
  input: unknown
): Promise<AcceptInvitationResult> {
  const parsed = acceptInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      `Indiquez votre nom, un mot de passe d’au moins ${MIN_PASSWORD_LENGTH} caractères, puis confirmez-le.`
    )
  }

  const invitation = await findInvitationByTokenHash(sha256(parsed.data.token))
  const now = new Date()

  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= now
  ) {
    throw new AppError(
      ErrorCode.INVITATION_INVALID,
      400,
      "Cette invitation n’est plus valable. Demandez un nouveau lien."
    )
  }

  if (invitation.user.status !== "ACTIVE") {
    throw new AppError(
      ErrorCode.ACCOUNT_DISABLED,
      403,
      "Ce compte est désactivé."
    )
  }

  if (invitation.user.credential) {
    throw new AppError(
      ErrorCode.INVITATION_INVALID,
      400,
      "Ce compte a déjà un mot de passe. Connectez-vous."
    )
  }

  const displayName = parsed.data.displayName
  const passwordHash = await hashPassword(parsed.data.password)

  await acceptInvitationRecord({
    invitationId: invitation.id,
    userId: invitation.user.id,
    displayName,
    passwordHash,
  })

  const email =
    invitation.user.identities.find((identity) => identity.type === "EMAIL")
      ?.value ?? null

  const shop = invitation.user.shopMembership?.shop
  const shopReady =
    shop && shop.status === "ACTIVE" && shop.partner.status === "ACTIVE"

  const user: AuthUser = {
    id: invitation.user.id,
    displayName,
    role: invitation.user.role,
    status: "ACTIVE",
    email,
    partnerId:
      invitation.user.role === "PARTNER_ADMIN"
        ? (invitation.user.partnerMemberships.find(
            (item) => item.partner.status === "ACTIVE"
          )?.partner.id ?? null)
        : invitation.user.role === "SHOP_STAFF" && shopReady
          ? shop.partner.id
          : null,
    partnerName:
      invitation.user.role === "PARTNER_ADMIN"
        ? (invitation.user.partnerMemberships.find(
            (item) => item.partner.status === "ACTIVE"
          )?.partner.name ?? null)
        : invitation.user.role === "SHOP_STAFF" && shopReady
          ? shop.partner.name
          : null,
    partnerLogo:
      invitation.user.role === "PARTNER_ADMIN"
        ? (invitation.user.partnerMemberships.find(
            (item) => item.partner.status === "ACTIVE"
          )?.partner.logo ?? null)
        : invitation.user.role === "SHOP_STAFF" && shopReady
          ? shop.partner.logo
          : null,
    shopId:
      invitation.user.role === "SHOP_STAFF" && shopReady ? shop.id : null,
    shopName:
      invitation.user.role === "SHOP_STAFF" && shopReady ? shop.name : null,
  }

  return {
    user,
    redirectTo: absoluteUrl(homePathFor(user.role)),
  }
}
