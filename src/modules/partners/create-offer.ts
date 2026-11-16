import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { inspectImage, removePublicUpload } from "@/platform/uploads"

import { assertCanManageOwnOffers } from "./assert-own-offers"
import { isUniqueConflict, parseOfferLabel } from "./offer-label"
import type { DirectoryPartnerOffer } from "./list-own-offers"
import { persistOfferImage } from "./persist-offer-image"
import {
  createOfferRecord,
  deleteOfferRecord,
  findPartnerById,
  nextOfferSortOrder,
  updateOfferRecord,
} from "./repository"

function toDirectoryOffer(offer: {
  id: string
  label: string
  kind: DirectoryPartnerOffer["kind"]
  image: string | null
  sortOrder: number
}): DirectoryPartnerOffer {
  return {
    id: offer.id,
    label: offer.label,
    kind: offer.kind,
    image: offer.image,
    sortOrder: offer.sortOrder,
  }
}

export async function createPartnerOffer(
  actor: AuthUser,
  input: unknown,
  imageBytes?: Buffer | null
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
  if (imageBytes && imageBytes.length > 0) {
    inspectImage(imageBytes)
  }

  let created: Awaited<ReturnType<typeof createOfferRecord>>
  try {
    created = await createOfferRecord({
      partnerId,
      label,
      kind: partner.rewardKind,
      sortOrder: await nextOfferSortOrder(partnerId),
    })
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

  if (!imageBytes || imageBytes.length === 0) {
    return toDirectoryOffer(created)
  }

  let image: string | null = null
  try {
    image = await persistOfferImage({
      offerId: created.id,
      bytes: imageBytes,
      previousImage: null,
    })
    const saved = await updateOfferRecord(created.id, { image })
    return toDirectoryOffer(saved)
  } catch (error) {
    await removePublicUpload(image)
    await deleteOfferRecord(created.id)
    throw error
  }
}
