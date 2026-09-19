import "server-only"

import { prisma } from "@/platform/db"

export async function sumCitizenPoints(userId: string): Promise<number> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { userId },
    _sum: { points: true },
  })
  return result._sum.points ?? 0
}

export async function findLatestConfirmedDeposit(userId: string) {
  return prisma.deposit.findFirst({
    where: { citizenId: userId, status: "CONFIRMED" },
    orderBy: { confirmedAt: "desc" },
    include: {
      shop: { select: { name: true, area: true } },
      lines: { select: { quantity: true, pointsEach: true } },
    },
  })
}
