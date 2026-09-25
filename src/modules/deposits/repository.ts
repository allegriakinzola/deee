import "server-only"

import type { DepositStatus } from "@/generated/prisma/client"

import { prisma } from "@/platform/db"

const depositInclude = {
  citizen: { select: { displayName: true } },
  shop: { select: { id: true, name: true, code: true, area: true } },
  lines: { orderBy: { name: "asc" as const } },
} as const

export async function findDraftByCitizen(citizenId: string) {
  return prisma.deposit.findFirst({
    where: { citizenId, status: "DRAFT" },
    include: depositInclude,
    orderBy: { createdAt: "desc" },
  })
}

export async function createDraftRecord(citizenId: string) {
  return prisma.deposit.create({
    data: { citizenId, status: "DRAFT" },
    include: depositInclude,
  })
}

export async function findDepositById(id: string) {
  return prisma.deposit.findUnique({
    where: { id },
    include: depositInclude,
  })
}

export async function listCitizenDeposits(citizenId: string) {
  return prisma.deposit.findMany({
    where: { citizenId, status: { not: "DRAFT" } },
    include: depositInclude,
    orderBy: { createdAt: "desc" },
  })
}

export async function listShopDeposits(shopId: string, statuses: DepositStatus[]) {
  return prisma.deposit.findMany({
    where: { shopId, status: { in: statuses } },
    include: depositInclude,
    orderBy: { sentAt: "desc" },
  })
}

export async function countShopDeposits(
  shopId: string,
  statuses: DepositStatus[]
) {
  return prisma.deposit.count({
    where: { shopId, status: { in: statuses } },
  })
}

export async function listShopDepositsSince(
  shopId: string,
  statuses: DepositStatus[],
  since: Date
) {
  return prisma.deposit.findMany({
    where: {
      shopId,
      status: { in: statuses },
      OR: [{ confirmedAt: { gte: since } }, { rejectedAt: { gte: since } }],
    },
    include: depositInclude,
    orderBy: { updatedAt: "desc" },
  })
}

export async function upsertDraftLine(input: {
  depositId: string
  materialId: string
  quantity: number
  pointsEach: number
  name: string
  category: string
  image: string
}) {
  if (input.quantity <= 0) {
    await prisma.depositLine.deleteMany({
      where: { depositId: input.depositId, materialId: input.materialId },
    })
    return
  }
  await prisma.depositLine.upsert({
    where: {
      depositId_materialId: {
        depositId: input.depositId,
        materialId: input.materialId,
      },
    },
    create: {
      depositId: input.depositId,
      materialId: input.materialId,
      quantity: input.quantity,
      pointsEach: input.pointsEach,
      name: input.name,
      category: input.category,
      image: input.image,
    },
    update: {
      quantity: input.quantity,
      pointsEach: input.pointsEach,
      name: input.name,
      category: input.category,
      image: input.image,
    },
  })
}

export async function sendDraftRecord(input: {
  depositId: string
  shopId: string
}) {
  const result = await prisma.deposit.updateMany({
    where: { id: input.depositId, status: "DRAFT" },
    data: {
      shopId: input.shopId,
      status: "SENT",
      sentAt: new Date(),
    },
  })
  if (result.count === 0) {
    return null
  }
  return prisma.deposit.findUnique({
    where: { id: input.depositId },
    include: depositInclude,
  })
}

export async function deleteCitizenDepositRecord(input: {
  depositId: string
  citizenId: string
}) {
  const result = await prisma.deposit.deleteMany({
    where: {
      id: input.depositId,
      citizenId: input.citizenId,
      status: { in: ["DRAFT", "SENT"] },
    },
  })
  return result.count > 0
}

export async function rejectDepositRecord(depositId: string) {
  return prisma.deposit.update({
    where: { id: depositId },
    data: { status: "REJECTED", rejectedAt: new Date() },
    include: depositInclude,
  })
}

export async function confirmDepositRecord(input: {
  depositId: string
  shopId: string
  confirmedById: string
  citizenId: string
  lines: Array<{
    materialId: string
    quantity: number
    pointsEach: number
    name: string
    category: string
    image: string
  }>
  points: number
}) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.deposit.findFirst({
      where: {
        id: input.depositId,
        shopId: input.shopId,
        status: "SENT",
      },
    })
    if (!current) {
      return null
    }

    await tx.depositLine.deleteMany({ where: { depositId: input.depositId } })
    if (input.lines.length > 0) {
      await tx.depositLine.createMany({
        data: input.lines.map((line) => ({
          depositId: input.depositId,
          materialId: line.materialId,
          quantity: line.quantity,
          pointsEach: line.pointsEach,
          name: line.name,
          category: line.category,
          image: line.image,
        })),
      })
    }

    const deposit = await tx.deposit.update({
      where: { id: input.depositId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        confirmedById: input.confirmedById,
      },
      include: depositInclude,
    })

    await tx.ledgerEntry.create({
      data: {
        userId: input.citizenId,
        depositId: input.depositId,
        kind: "DEPOSIT_CREDIT",
        points: input.points,
      },
    })

    return deposit
  })
}
