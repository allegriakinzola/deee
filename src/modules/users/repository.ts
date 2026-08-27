import "server-only"

import { prisma } from "@/platform/db"

import type { PlatformInvitableRole, UserAccess } from "./contract"

export async function listUsersWithIdentities() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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
  })
}

export function accessFromUser(user: {
  credential: { userId: string } | null
  invitations: Array<{
    acceptedAt: Date | null
    revokedAt: Date | null
    expiresAt: Date
  }>
}): UserAccess {
  if (user.credential) {
    return "READY"
  }

  const latest = user.invitations[0]
  if (
    latest &&
    !latest.acceptedAt &&
    !latest.revokedAt &&
    latest.expiresAt > new Date()
  ) {
    return "PENDING"
  }

  return "EXPIRED"
}

export async function findUserByEmail(email: string) {
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

export async function countActiveGvbAdmins(): Promise<number> {
  return prisma.user.count({
    where: { role: "GVB_ADMIN", status: "ACTIVE" },
  })
}

export async function findFirstActiveGvbAdmin() {
  return prisma.user.findFirst({
    where: { role: "GVB_ADMIN", status: "ACTIVE" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function countGvbAdminsExcluding(userId: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: "GVB_ADMIN",
      id: { not: userId },
    },
  })
}

export async function createInvitedUser(input: {
  displayName: string
  email: string
  role: PlatformInvitableRole
  invitedById: string
  tokenHash: string
  expiresAt: Date
}) {
  return prisma.user.create({
    data: {
      displayName: input.displayName,
      role: input.role,
      status: "ACTIVE",
      identities: {
        create: {
          type: "EMAIL",
          value: input.email,
        },
      },
      invitations: {
        create: {
          invitedById: input.invitedById,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      },
    },
  })
}

export async function rotateInvitation(input: {
  userId: string
  displayName: string
  role: PlatformInvitableRole
  invitedById: string
  tokenHash: string
  expiresAt: Date
}) {
  await prisma.$transaction([
    prisma.invitation.updateMany({
      where: { userId: input.userId, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: input.userId },
      data: {
        displayName: input.displayName,
        role: input.role,
        status: "ACTIVE",
      },
    }),
    prisma.invitation.create({
      data: {
        userId: input.userId,
        invitedById: input.invitedById,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    }),
  ])
}

export async function findInvitationByTokenHash(tokenHash: string) {
  return prisma.invitation.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          identities: true,
          credential: { select: { userId: true } },
          partnerMemberships: {
            include: {
              partner: {
                select: { id: true, name: true, logo: true, status: true },
              },
            },
          },
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
        },
      },
    },
  })
}

export async function acceptInvitationRecord(input: {
  invitationId: string
  userId: string
  displayName: string
  passwordHash: string
}) {
  const now = new Date()
  await prisma.$transaction([
    prisma.invitation.update({
      where: { id: input.invitationId },
      data: { acceptedAt: now },
    }),
    prisma.user.update({
      where: { id: input.userId },
      data: {
        displayName: input.displayName,
        status: "ACTIVE",
        identities: {
          updateMany: {
            where: { type: "EMAIL" },
            data: { verifiedAt: now },
          },
        },
        credential: {
          create: { passwordHash: input.passwordHash },
        },
      },
    }),
  ])
}

export async function updateUserStatus(
  userId: string,
  status: "ACTIVE" | "DISABLED"
) {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
  })
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      identities: true,
      credential: { select: { userId: true } },
    },
  })
}

export async function revokeOpenInvitations(userId: string) {
  await prisma.invitation.updateMany({
    where: { userId, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function reassignAndDeleteUser(input: {
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
