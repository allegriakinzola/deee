import "server-only"

import type {
  PartnerKind,
  PartnerStatus,
  RewardKind,
} from "@/generated/prisma/client"

import { defaultOfferLabels } from "@/lib/reward-offers"
import { prisma } from "@/platform/db"

export async function countPartners(status?: PartnerStatus) {
  return prisma.partner.count({
    where: status ? { status } : undefined,
  })
}

export async function countPartnerMemberships(partnerId: string) {
  return prisma.partnerMembership.count({ where: { partnerId } })
}

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
  rewardKind: RewardKind
  logo: string | null
}) {
  const labels = defaultOfferLabels(input.rewardKind)
  return prisma.partner.create({
    data: {
      name: input.name,
      shortName: input.shortName,
      slug: input.slug,
      kind: input.kind,
      rewardKind: input.rewardKind,
      offersReady: true,
      logo: input.logo,
      offers: {
        create: labels.map((label, sortOrder) => ({
          label,
          kind: input.rewardKind,
          sortOrder,
        })),
      },
    },
  })
}

export async function listPartnerOffers(partnerId: string) {
  return prisma.partnerOffer.findMany({
    where: { partnerId, status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  })
}

export async function markOffersReady(partnerId: string) {
  await prisma.partner.update({
    where: { id: partnerId },
    data: { offersReady: true },
  })
}

export async function nextOfferSortOrder(partnerId: string) {
  const last = await prisma.partnerOffer.aggregate({
    where: { partnerId },
    _max: { sortOrder: true },
  })
  return (last._max.sortOrder ?? -1) + 1
}

export async function createOfferRecord(input: {
  partnerId: string
  label: string
  kind: RewardKind
  sortOrder: number
}) {
  return prisma.partnerOffer.create({ data: input })
}

export async function findOfferForPartner(partnerId: string, offerId: string) {
  return prisma.partnerOffer.findFirst({
    where: { id: offerId, partnerId },
  })
}

export async function updateOfferLabel(offerId: string, label: string) {
  return prisma.partnerOffer.update({
    where: { id: offerId },
    data: { label },
  })
}

export async function deleteOfferRecord(offerId: string) {
  await prisma.partnerOffer.delete({ where: { id: offerId } })
}

export async function listActiveOffers(partnerId: string, rewardKind: RewardKind) {
  return prisma.partnerOffer.findMany({
    where: { partnerId, kind: rewardKind, status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  })
}

export async function ensureDefaultOffers(
  partnerId: string,
  rewardKind: RewardKind
) {
  const count = await prisma.partnerOffer.count({ where: { partnerId } })
  if (count > 0) {
    return
  }
  const labels = defaultOfferLabels(rewardKind)
  await prisma.partnerOffer.createMany({
    data: labels.map((label, sortOrder) => ({
      partnerId,
      label,
      kind: rewardKind,
      sortOrder,
    })),
    skipDuplicates: true,
  })
}

export async function findActiveOffer(
  partnerId: string,
  offerId: string,
  rewardKind: RewardKind
) {
  return prisma.partnerOffer.findFirst({
    where: {
      id: offerId,
      partnerId,
      kind: rewardKind,
      status: "ACTIVE",
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
