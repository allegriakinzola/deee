import "server-only"

import { canManageMaterials } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManageMaterials(actor: AuthUser): void {
  if (!canManageMaterials(actor.role)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un administrateur GVB peut gérer les matériels."
    )
  }
}
