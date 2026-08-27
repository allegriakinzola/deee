import "server-only"

import { sha256 } from "@/platform/crypto"

import { isPlatformInvitableRole } from "./contract"
import { findInvitationByTokenHash } from "./repository"

export type InvitationPreview = {
  displayName: string
  email: string | null
  role:
    | "GVB_ADMIN"
    | "GVB_COLLECTOR"
    | "PARTNER_ADMIN"
    | "SHOP_STAFF"
    | "CITIZEN"
  partnerName: string | null
  shopName: string | null
}

export async function peekInvitation(
  token: string
): Promise<InvitationPreview | null> {
  if (!token) {
    return null
  }

  const invitation = await findInvitationByTokenHash(sha256(token))
  const now = new Date()

  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= now ||
    invitation.user.credential ||
    invitation.user.status !== "ACTIVE"
  ) {
    return null
  }

  if (!isPlatformInvitableRole(invitation.user.role)) {
    return null
  }

  const partnerMembership = invitation.user.partnerMemberships.find(
    (item) => item.partner.status === "ACTIVE"
  )
  const shop = invitation.user.shopMembership?.shop

  return {
    displayName: invitation.user.displayName,
    email:
      invitation.user.identities.find((identity) => identity.type === "EMAIL")
        ?.value ?? null,
    role: invitation.user.role,
    partnerName: partnerMembership?.partner.name ?? shop?.partner.name ?? null,
    shopName: shop?.name ?? null,
  }
}
