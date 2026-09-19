import "server-only"

import { canAccessCitizenSpace } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { sumCitizenPoints, findLatestConfirmedDeposit } from "./repository"

export type CitizenBalance = {
  points: number
  lastDeposit: {
    shopName: string
    points: number
    confirmedAt: string
  } | null
}

export async function getCitizenBalance(
  actor: AuthUser
): Promise<CitizenBalance> {
  if (!canAccessCitizenSpace(actor.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace citoyen uniquement.")
  }

  const [points, last] = await Promise.all([
    sumCitizenPoints(actor.id),
    findLatestConfirmedDeposit(actor.id),
  ])

  return {
    points,
    lastDeposit:
      last && last.shop && last.confirmedAt
        ? {
            shopName: last.shop.name,
            points: last.lines.reduce(
              (sum, line) => sum + line.quantity * line.pointsEach,
              0
            ),
            confirmedAt: last.confirmedAt.toISOString(),
          }
        : null,
  }
}
