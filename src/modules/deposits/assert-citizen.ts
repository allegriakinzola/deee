import "server-only"

import { canAccessCitizenSpace } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCitizen(actor: AuthUser): void {
  if (!canAccessCitizenSpace(actor.role)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un citoyen peut préparer un dépôt."
    )
  }
}
