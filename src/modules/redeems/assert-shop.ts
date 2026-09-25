import "server-only"

import { canAccessShopSpace } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

export function assertShopStaff(actor: AuthUser): string {
  if (!canAccessShopSpace(actor.role, actor.shopId) || !actor.shopId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul le responsable du shop peut traiter un échange."
    )
  }
  return actor.shopId
}
