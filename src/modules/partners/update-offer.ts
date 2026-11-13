import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageOwnOffers } from "./assert-own-offers"
import type { DirectoryPartnerOffer } from "./list-own-offers"
import { isUniqueConflict, parseOfferLabel } from "./offer-label"
import { findOfferForPartner, updateOfferLabel } from "./repository"

export async function updatePartnerOffer(
  actor: AuthUser,
  offerId: string,
  input: unknown
): Promise<DirectoryPartnerOffer> {
  const partnerId = assertCanManageOwnOffers(actor)
  const label = parseOfferLabel(
    typeof input === "object" && input !== null && "label" in input
      ? input.label
      : input
  )
  const existing = await findOfferForPartner(partnerId, offerId)
  if (!existing || existing.status !== "ACTIVE") {
    throw new AppError(ErrorCode.VALIDATION, 404, "Cette offre n’existe pas.")
  }
  if (existing.label === label) {
    return {
      id: existing.id,
      label: existing.label,
      kind: existing.kind,
      sortOrder: existing.sortOrder,
    }
  }

  try {
    const updated = await updateOfferLabel(existing.id, label)
    return {
      id: updated.id,
      label: updated.label,
      kind: updated.kind,
      sortOrder: updated.sortOrder,
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
