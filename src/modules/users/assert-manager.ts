import "server-only"

import { canManageUsers } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManageUsers(actor: AuthUser): void {
  if (!canManageUsers(actor.role)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un administrateur GVB peut gérer les utilisateurs."
    )
  }
}
