import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { inspectImage, removePublicUpload } from "@/platform/uploads"

import { assertCanManageOwnOffers } from "./assert-own-offers"
import type { DirectoryPartnerOffer } from "./list-own-offers"
import { isUniqueConflict, parseOfferLabel } from "./offer-label"
import { persistOfferImage } from "./persist-offer-image"
import { findOfferForPartner, updateOfferRecord } from "./repository"

export async function updatePartnerOffer(
  actor: AuthUser,
  offerId: string,
  input: unknown,
  imageBytes?: Buffer | null,
  removeImage = false
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
  const hasNewImage = Boolean(imageBytes && imageBytes.length > 0)
  if (hasNewImage && imageBytes) {
    inspectImage(imageBytes)
  }
  if (existing.label === label && !hasNewImage && !removeImage) {
    return {
      id: existing.id,
      label: existing.label,
      kind: existing.kind,
      image: existing.image,
      sortOrder: existing.sortOrder,
    }
  }

  try {
    let image = existing.image
    if (hasNewImage && imageBytes) {
      image = await persistOfferImage({
        offerId: existing.id,
        bytes: imageBytes,
        previousImage: existing.image,
      })
    } else if (removeImage) {
      await removePublicUpload(existing.image)
      image = null
    }
    const updated = await updateOfferRecord(existing.id, { label, image })
    return {
      id: updated.id,
      label: updated.label,
      kind: updated.kind,
      image: updated.image,
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
