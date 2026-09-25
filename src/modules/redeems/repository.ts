import "server-only"

import type { RedeemStatus } from "@/generated/prisma/client"

import { prisma } from "@/platform/db"

const redeemInclude = {
  citizen: { select: { displayName: true } },
  shop: { select: { id: true, name: true, code: true, area: true } },
} as const

export async function sumPendingRedeemPoints(citizenId: string): Promise<number> {
  const result = await prisma.redeem.aggregate({
    where: { citizenId, status: "SENT" },
    _sum: { points: true },
  })
  return result._sum.points ?? 0
}

export async function findRedeemById(id: string) {
  return prisma.redeem.findUnique({
    where: { id },
    include: redeemInclude,
  })
}

export async function listCitizenRedeems(citizenId: string) {
  return prisma.redeem.findMany({
    where: { citizenId },
    include: redeemInclude,
    orderBy: { createdAt: "desc" },
  })
}

export async function listShopRedeems(shopId: string, statuses: RedeemStatus[]) {
  return prisma.redeem.findMany({
    where: { shopId, status: { in: statuses } },
    include: redeemInclude,
    orderBy: { sentAt: "desc" },
  })
}

export async function countShopRedeems(
  shopId: string,
  statuses: RedeemStatus[]
) {
  return prisma.redeem.count({
    where: { shopId, status: { in: statuses } },
  })
}

export async function listShopRedeemsSince(
  shopId: string,
  statuses: RedeemStatus[],
  since: Date
) {
  return prisma.redeem.findMany({
    where: {
      shopId,
      status: { in: statuses },
      OR: [{ confirmedAt: { gte: since } }, { rejectedAt: { gte: since } }],
    },
    include: redeemInclude,
    orderBy: { updatedAt: "desc" },
  })
}

export async function createSentRedeemRecord(input: {
  citizenId: string
  shopId: string
  bons: number
  points: number
  rewardId: string
  rewardLabel: string
  partnerKind: "TELECOM" | "BANK" | "PRODUCTS"
  usdValue: string
}) {
  return prisma.$transaction(async (tx) => {
    const [balance, pending] = await Promise.all([
      tx.ledgerEntry.aggregate({
        where: { userId: input.citizenId },
        _sum: { points: true },
      }),
      tx.redeem.aggregate({
        where: { citizenId: input.citizenId, status: "SENT" },
        _sum: { points: true },
      }),
    ])
    const available = (balance._sum.points ?? 0) - (pending._sum.points ?? 0)
    if (available < input.points) {
      return null
    }

    return tx.redeem.create({
      data: {
        citizenId: input.citizenId,
        shopId: input.shopId,
        status: "SENT",
        bons: input.bons,
        points: input.points,
        rewardId: input.rewardId,
        rewardLabel: input.rewardLabel,
        partnerKind: input.partnerKind,
        usdValue: input.usdValue,
      },
      include: redeemInclude,
    })
  })
}

export async function rejectRedeemRecord(redeemId: string) {
  return prisma.redeem.update({
    where: { id: redeemId },
    data: { status: "REJECTED", rejectedAt: new Date() },
    include: redeemInclude,
  })
}

export async function confirmRedeemRecord(input: {
  redeemId: string
  shopId: string
  confirmedById: string
  citizenId: string
  points: number
}) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.redeem.findFirst({
      where: {
        id: input.redeemId,
        shopId: input.shopId,
        status: "SENT",
      },
    })
    if (!current) {
      return { status: "missing" as const }
    }

    const balance = await tx.ledgerEntry.aggregate({
      where: { userId: input.citizenId },
      _sum: { points: true },
    })
    if ((balance._sum.points ?? 0) < input.points) {
      return { status: "insufficient" as const }
    }

    const redeem = await tx.redeem.update({
      where: { id: input.redeemId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        confirmedById: input.confirmedById,
      },
      include: redeemInclude,
    })

    await tx.ledgerEntry.create({
      data: {
        userId: input.citizenId,
        redeemId: input.redeemId,
        kind: "REDEEM_DEBIT",
        points: -input.points,
      },
    })

    return { status: "ok" as const, redeem }
  })
}
