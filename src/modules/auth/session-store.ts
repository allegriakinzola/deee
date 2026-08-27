import "server-only"

import { prisma } from "@/platform/db"
import { randomToken, sha256 } from "@/platform/crypto"

import { SESSION_TTL_MS } from "./session-constants"
import type { AuthUser } from "./types"

export const partnerMembershipInclude = {
  partnerMemberships: {
    include: {
      partner: { select: { id: true, name: true, logo: true, status: true } },
    },
  },
} as const

export const shopMembershipInclude = {
  shopMembership: {
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          status: true,
          partner: {
            select: { id: true, name: true, logo: true, status: true },
          },
        },
      },
    },
  },
} as const

type UserWithIdentities = {
  id: string
  displayName: string
  role: AuthUser["role"]
  status: AuthUser["status"]
  identities: Array<{ type: "EMAIL" | "PHONE"; value: string }>
  partnerMemberships?: Array<{
    partner: {
      id: string
      name: string
      logo: string | null
      status: "ACTIVE" | "DISABLED"
    }
  }>
  shopMembership?: {
    shop: {
      id: string
      name: string
      status: "ACTIVE" | "DISABLED"
      partner: {
        id: string
        name: string
        logo: string | null
        status: "ACTIVE" | "DISABLED"
      }
    }
  } | null
}

export function toAuthUser(user: UserWithIdentities): AuthUser {
  const partnerMembership = user.partnerMemberships?.find(
    (item) => item.partner.status === "ACTIVE"
  )
  const shop = user.shopMembership?.shop
  const shopReady =
    shop && shop.status === "ACTIVE" && shop.partner.status === "ACTIVE"

  return {
    id: user.id,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    email:
      user.identities.find((identity) => identity.type === "EMAIL")?.value ??
      null,
    partnerId:
      user.role === "PARTNER_ADMIN"
        ? (partnerMembership?.partner.id ?? null)
        : user.role === "SHOP_STAFF" && shopReady
          ? shop.partner.id
          : null,
    partnerName:
      user.role === "PARTNER_ADMIN"
        ? (partnerMembership?.partner.name ?? null)
        : user.role === "SHOP_STAFF" && shopReady
          ? shop.partner.name
          : null,
    partnerLogo:
      user.role === "PARTNER_ADMIN"
        ? (partnerMembership?.partner.logo ?? null)
        : user.role === "SHOP_STAFF" && shopReady
          ? shop.partner.logo
          : null,
    shopId: user.role === "SHOP_STAFF" && shopReady ? shop.id : null,
    shopName: user.role === "SHOP_STAFF" && shopReady ? shop.name : null,
  }
}

export async function createSession(userId: string): Promise<{
  token: string
  expiresAt: Date
}> {
  const token = randomToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await prisma.$transaction([
    prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.session.create({
      data: {
        userId,
        tokenHash: sha256(token),
        expiresAt,
      },
    }),
  ])

  return { token, expiresAt }
}

export async function findUserBySessionToken(
  token: string
): Promise<AuthUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      user: {
        include: {
          identities: true,
          ...partnerMembershipInclude,
          ...shopMembershipInclude,
        },
      },
    },
  })

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null
  }

  if (session.user.status !== "ACTIVE") {
    return null
  }

  return toAuthUser(session.user)
}

export async function revokeSessionToken(token: string): Promise<void> {
  await prisma.session.updateMany({
    where: { tokenHash: sha256(token), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
