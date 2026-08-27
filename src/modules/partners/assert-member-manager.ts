import "server-only"

import { canManagePartnerMembers } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertCanManagePartnerMembers(
  actor: AuthUser,
  partnerId: string
): void {
  if (!canManagePartnerMembers(actor.role, actor.partnerId, partnerId)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Vous ne pouvez gérer que les utilisateurs de votre entreprise."
    )
  }
}
