import "server-only"

import { canManageOwnShops } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManageOwnShops(actor: AuthUser): string {
  if (!canManageOwnShops(actor.role, actor.partnerId) || !actor.partnerId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un administrateur d’entreprise peut gérer les shops."
    )
  }
  return actor.partnerId
}
