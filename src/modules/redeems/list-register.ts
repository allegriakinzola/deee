import "server-only"

import type { RedeemStatus } from "@/generated/prisma/client"
import { canAccessGvbAdmin, canAccessPartnerAdmin } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import type { DirectoryRedeem } from "./contract"
import { toDirectoryRedeem } from "./present"
import { listScopedRedeems } from "./repository"

const LIMIT = 200
const STATUSES: RedeemStatus[] = ["SENT", "CONFIRMED", "REJECTED"]

async function load(scope: {
  partnerId?: string
}): Promise<{ redeems: DirectoryRedeem[]; truncated: boolean }> {
  const rows = await listScopedRedeems(scope, STATUSES, LIMIT + 1)
  return {
    redeems: rows.slice(0, LIMIT).map(toDirectoryRedeem),
    truncated: rows.length > LIMIT,
  }
}

export async function listAdminRedeems(
  actor: AuthUser
): Promise<{ redeems: DirectoryRedeem[]; truncated: boolean }> {
  if (!canAccessGvbAdmin(actor.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace opérateur uniquement.")
  }
  return load({})
}

export async function listPartnerRedeems(
  actor: AuthUser
): Promise<{ redeems: DirectoryRedeem[]; truncated: boolean }> {
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId) || !actor.partnerId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Espace partenaire uniquement."
    )
  }
  return load({ partnerId: actor.partnerId })
}
