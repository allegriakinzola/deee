import "server-only"

import { canManagePartners } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManagePartners(actor: AuthUser): void {
  if (!canManagePartners(actor.role)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un administrateur GVB peut gérer les partenaires."
    )
  }
}
