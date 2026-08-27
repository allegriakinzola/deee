import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManagePartners } from "./assert-manager"
import { persistPartnerLogo } from "./persist-logo"
import { findPartnerById, updatePartnerLogo } from "./repository"

export async function setPartnerLogo(
  actor: AuthUser,
  partnerId: string,
  logoBytes: Buffer | null
) {
  assertCanManagePartners(actor)

  if (!logoBytes || logoBytes.length === 0) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Choisissez un fichier logo."
    )
  }

  const partner = await findPartnerById(partnerId)
  if (!partner) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce partenaire n’existe pas.")
  }

  const logo = await persistPartnerLogo({
    partnerId: partner.id,
    bytes: logoBytes,
    previousLogo: partner.logo,
  })
  await updatePartnerLogo(partner.id, logo)

  return { id: partner.id, logo }
}
