import "server-only"

import { canAccessPartnerAdmin } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManageOwnOffers(actor: AuthUser): string {
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId) || !actor.partnerId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul l’administrateur du partenaire peut gérer ses offres."
    )
  }
  return actor.partnerId
}
