import "server-only"

import { randomToken, sha256 } from "@/platform/crypto"
import { AppError, ErrorCode } from "@/platform/errors"
import { absoluteUrl } from "@/platform/site-url"

import { INVITATION_TTL_MS } from "./constants"
import {
  GVB_INVITABLE_ROLES,
  type PlatformInvitableRole,
} from "./contract"
import {
  createInvitedUser,
  findUserByEmail,
  rotateInvitation,
} from "./repository"

export type ProvisionedInvitation = {
  userId: string
  token: string
  invitationUrl: string
  expiresAt: Date
}

export async function provisionInvitedUser(input: {
  displayName: string
  email: string
  role: PlatformInvitableRole
  invitedById: string
}): Promise<ProvisionedInvitation> {
  const existing = await findUserByEmail(input.email)
  if (existing?.credential) {
    throw new AppError(
      ErrorCode.EMAIL_TAKEN,
      409,
      "Un compte existe déjà pour cet e-mail."
    )
  }

  if (existing && !canReusePendingUser(existing.role, input.role)) {
    throw new AppError(
      ErrorCode.EMAIL_TAKEN,
      409,
      "Un compte existe déjà pour cet e-mail."
    )
  }

  const token = randomToken()
  const tokenHash = sha256(token)
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS)

  let userId: string
  if (existing) {
    await rotateInvitation({
      userId: existing.id,
      displayName: input.displayName,
      role: input.role,
      invitedById: input.invitedById,
      tokenHash,
      expiresAt,
    })
    userId = existing.id
  } else {
    const created = await createInvitedUser({
      displayName: input.displayName,
      email: input.email,
      role: input.role,
      invitedById: input.invitedById,
      tokenHash,
      expiresAt,
    })
    userId = created.id
  }

  return {
    userId,
    token,
    invitationUrl: absoluteUrl(`/invitation/${token}`),
    expiresAt,
  }
}

function canReusePendingUser(
  existingRole: string,
  invitedRole: PlatformInvitableRole
): boolean {
  const existingIsGvb = (GVB_INVITABLE_ROLES as readonly string[]).includes(
    existingRole
  )
  const invitedIsGvb = (GVB_INVITABLE_ROLES as readonly string[]).includes(
    invitedRole
  )

  if (invitedIsGvb) {
    return existingIsGvb
  }

  if (invitedRole === "PARTNER_ADMIN") {
    return existingRole === "PARTNER_ADMIN"
  }

  if (invitedRole === "SHOP_STAFF") {
    return existingRole === "SHOP_STAFF"
  }

  return existingRole === "CITIZEN"
}
