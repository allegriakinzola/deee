import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { removePublicUpload } from "@/platform/uploads"

import { assertCanManageOwnOffers } from "./assert-own-offers"
import { deleteOfferRecord, findOfferForPartner } from "./repository"

export async function deletePartnerOffer(actor: AuthUser, offerId: string) {
  const partnerId = assertCanManageOwnOffers(actor)
  const existing = await findOfferForPartner(partnerId, offerId)
  if (!existing) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Cette offre n’existe pas.")
  }
  await deleteOfferRecord(existing.id)
  return { id: existing.id }
}
