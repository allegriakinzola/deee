import "server-only"

import type { ShopStatus } from "@/generated/prisma/client"

import { prisma } from "@/platform/db"

const operatorInclude = {
  membership: {
    include: {
      user: {
        include: {
          identities: true,
          credential: { select: { userId: true } },
          invitations: {
            orderBy: { createdAt: "desc" as const },
            take: 1,
            select: {
              acceptedAt: true,
              revokedAt: true,
              expiresAt: true,
            },
          },
        },
      },
    },
  },
}

const partnerSelect = {
  id: true,
  name: true,
  shortName: true,
  logo: true,
} as const

export async function listShopsForPartner(partnerId: string) {
  return prisma.shop.findMany({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
    include: {
      partner: { select: partnerSelect },
      ...operatorInclude,
    },
  })
}

export async function listAllShops() {
  return prisma.shop.findMany({
    orderBy: [{ partner: { name: "asc" } }, { name: "asc" }],
    include: {
      partner: { select: partnerSelect },
      ...operatorInclude,
    },
  })
}

export async function findShopById(id: string) {
  return prisma.shop.findUnique({
    where: { id },
    include: {
      partner: { select: partnerSelect },
      ...operatorInclude,
    },
  })
}

export async function findShopByPartnerSlug(partnerId: string, slug: string) {
  return prisma.shop.findUnique({
    where: { partnerId_slug: { partnerId, slug } },
  })
}

export async function createShopRecord(input: {
  partnerId: string
  name: string
  slug: string
  area: string
  lat: number
  lng: number
}) {
  return prisma.shop.create({
    data: {
      partnerId: input.partnerId,
      name: input.name,
      slug: input.slug,
      area: input.area,
      lat: input.lat,
      lng: input.lng,
    },
  })
}

export async function updateShopRecord(
  shopId: string,
  data: { name: string; slug: string; area: string; lat: number; lng: number }
) {
  return prisma.shop.update({
    where: { id: shopId },
    data,
  })
}

export async function updateShopStatus(shopId: string, status: ShopStatus) {
  return prisma.shop.update({
    where: { id: shopId },
    data: { status },
  })
}

export async function deleteShopRecord(shopId: string) {
  await prisma.shop.delete({ where: { id: shopId } })
}

export async function findUserByEmailWithShop(email: string) {
  const identity = await prisma.identity.findUnique({
    where: { type_value: { type: "EMAIL", value: email } },
    include: {
      user: {
        include: {
          credential: { select: { userId: true } },
          shopMembership: { select: { shopId: true } },
        },
      },
    },
  })
  return identity?.user ?? null
}

export async function ensureShopMembership(input: {
  shopId: string
  userId: string
}) {
  await prisma.shopMembership.upsert({
    where: { shopId: input.shopId },
    create: { shopId: input.shopId, userId: input.userId },
    update: { userId: input.userId },
  })
}

export async function deletePendingOperator(userId: string, successorId: string) {
  await prisma.$transaction([
    prisma.invitation.updateMany({
      where: { invitedById: userId },
      data: { invitedById: successorId },
    }),
    prisma.user.delete({ where: { id: userId } }),
  ])
}
