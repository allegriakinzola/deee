import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageOwnOffers } from "./assert-own-offers"
import { isUniqueConflict, parseOfferLabel } from "./offer-label"
import type { DirectoryPartnerOffer } from "./list-own-offers"
import {
  createOfferRecord,
  findPartnerById,
  nextOfferSortOrder,
} from "./repository"

export async function createPartnerOffer(
  actor: AuthUser,
  input: unknown
): Promise<DirectoryPartnerOffer> {
  const partnerId = assertCanManageOwnOffers(actor)
  const label = parseOfferLabel(
    typeof input === "object" && input !== null && "label" in input
      ? input.label
      : input
  )
  const partner = await findPartnerById(partnerId)
  if (!partner) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce partenaire n’existe pas.")
  }

  try {
    const created = await createOfferRecord({
      partnerId,
      label,
      kind: partner.rewardKind,
      sortOrder: await nextOfferSortOrder(partnerId),
    })
    return {
      id: created.id,
      label: created.label,
      kind: created.kind,
      sortOrder: created.sortOrder,
    }
  } catch (error) {
    if (isUniqueConflict(error)) {
      throw new AppError(
        ErrorCode.NAME_TAKEN,
        409,
        "Cette offre existe déjà pour votre entreprise."
      )
    }
    throw error
  }
}
