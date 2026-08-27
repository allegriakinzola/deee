import "server-only"

import type { PartnerKind, PartnerStatus } from "@/generated/prisma/client"

import { prisma } from "@/platform/db"

export async function listPartnersWithAdmins() {
  return prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships: {
        include: {
          user: {
            include: {
              identities: true,
              credential: { select: { userId: true } },
              invitations: {
                orderBy: { createdAt: "desc" },
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
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export async function findPartnerById(id: string) {
  return prisma.partner.findUnique({
    where: { id },
    include: {
      memberships: { select: { userId: true, partnerId: true } },
      shops: {
        select: {
          membership: { select: { userId: true } },
        },
      },
    },
  })
}

export async function findPartnerBySlug(slug: string) {
  return prisma.partner.findUnique({ where: { slug } })
}

export async function createPartnerRecord(input: {
  name: string
  shortName: string
  slug: string
  kind: PartnerKind
  logo: string | null
}) {
  return prisma.partner.create({
    data: {
      name: input.name,
      shortName: input.shortName,
      slug: input.slug,
      kind: input.kind,
      logo: input.logo,
    },
  })
}

export async function updatePartnerLogo(partnerId: string, logo: string | null) {
  return prisma.partner.update({
    where: { id: partnerId },
    data: { logo },
  })
}

export async function updatePartnerStatus(
  partnerId: string,
  status: PartnerStatus
) {
  return prisma.partner.update({
    where: { id: partnerId },
    data: { status },
  })
}

export async function deletePartnerRecord(partnerId: string) {
  await prisma.partner.delete({ where: { id: partnerId } })
}

export async function listMembershipsForUser(userId: string) {
  return prisma.partnerMembership.findMany({
    where: { userId },
    select: { partnerId: true },
  })
}

export async function findUserByEmailWithMemberships(email: string) {
  const identity = await prisma.identity.findUnique({
    where: { type_value: { type: "EMAIL", value: email } },
    include: {
      user: {
        include: {
          credential: { select: { userId: true } },
          partnerMemberships: { select: { partnerId: true } },
        },
      },
    },
  })
  return identity?.user ?? null
}

export async function ensurePartnerMembership(input: {
  partnerId: string
  userId: string
}) {
  await prisma.partnerMembership.upsert({
    where: {
      partnerId_userId: {
        partnerId: input.partnerId,
        userId: input.userId,
      },
    },
    create: {
      partnerId: input.partnerId,
      userId: input.userId,
    },
    update: {},
  })
}

export async function listMembersForPartner(partnerId: string) {
  return prisma.partnerMembership.findMany({
    where: { partnerId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        include: {
          identities: true,
          credential: { select: { userId: true } },
          invitations: {
            orderBy: { createdAt: "desc" },
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
  })
}

export async function findMemberInPartner(partnerId: string, userId: string) {
  return prisma.partnerMembership.findUnique({
    where: {
      partnerId_userId: { partnerId, userId },
    },
    include: {
      user: {
        include: {
          credential: { select: { userId: true } },
        },
      },
    },
  })
}

export async function countActivePartnerAdmins(
  partnerId: string
): Promise<number> {
  return prisma.partnerMembership.count({
    where: {
      partnerId,
      user: { role: "PARTNER_ADMIN", status: "ACTIVE" },
    },
  })
}

export async function countPartnerMembersExcluding(
  partnerId: string,
  userId: string
): Promise<number> {
  return prisma.partnerMembership.count({
    where: { partnerId, userId: { not: userId } },
  })
}

export async function updateMemberUserStatus(
  userId: string,
  status: "ACTIVE" | "DISABLED"
) {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
  })
}

export async function revokeMemberInvitations(userId: string) {
  await prisma.invitation.updateMany({
    where: { userId, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function reassignAndDeleteMember(input: {
  userId: string
  successorId: string
}) {
  await prisma.$transaction([
    prisma.invitation.updateMany({
      where: { invitedById: input.userId },
      data: { invitedById: input.successorId },
    }),
    prisma.user.delete({
      where: { id: input.userId },
    }),
  ])
}
