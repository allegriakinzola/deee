import "server-only"

import { canManageSettings } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManageSettings(actor: AuthUser): void {
  if (!canManageSettings(actor.role)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un administrateur GVB peut modifier les paramètres."
    )
  }
}
