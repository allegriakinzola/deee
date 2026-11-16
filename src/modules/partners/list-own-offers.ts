import "server-only"

import type { RewardKind } from "@/generated/prisma/client"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageOwnOffers } from "./assert-own-offers"
import {
  ensureDefaultOffers,
  findPartnerById,
  listPartnerOffers,
  markOffersReady,
} from "./repository"

export type DirectoryPartnerOffer = {
  id: string
  label: string
  kind: RewardKind
  image: string | null
  sortOrder: number
}

export type PartnerOfferBoard = {
  rewardKind: RewardKind
  offers: DirectoryPartnerOffer[]
}

export async function listOwnPartnerOffers(
  actor: AuthUser
): Promise<PartnerOfferBoard> {
  const partnerId = assertCanManageOwnOffers(actor)
  const partner = await findPartnerById(partnerId)
  if (!partner) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce partenaire n’existe pas.")
  }

  if (!partner.offersReady) {
    await ensureDefaultOffers(partnerId, partner.rewardKind)
    await markOffersReady(partnerId)
  }

  const rows = await listPartnerOffers(partnerId)
  return {
    rewardKind: partner.rewardKind,
    offers: rows
      .filter((row) => row.kind === partner.rewardKind)
      .map((row) => ({
        id: row.id,
        label: row.label,
        kind: row.kind,
        image: row.image,
        sortOrder: row.sortOrder,
      })),
  }
}
