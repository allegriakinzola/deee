import "server-only"

import { canManageCatalogs } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManageCatalogs(actor: AuthUser): void {
  if (!canManageCatalogs(actor.role)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un administrateur GVB peut gérer les catalogues."
    )
  }
}
