import "server-only"

import type { DepositStatus } from "@/generated/prisma/client"
import { canAccessGvbAdmin, canAccessPartnerAdmin } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import type { DirectoryDeposit } from "./contract"
import { toDirectoryDeposit } from "./present"
import { listScopedDeposits } from "./repository"

const LIMIT = 200

const NETWORK: DepositStatus[] = ["DRAFT", "SENT", "CONFIRMED", "REJECTED"]
const PARTNER: DepositStatus[] = ["SENT", "CONFIRMED", "REJECTED"]

async function load(
  scope: { partnerId?: string },
  statuses: DepositStatus[]
): Promise<{ deposits: DirectoryDeposit[]; truncated: boolean }> {
  const rows = await listScopedDeposits(scope, statuses, LIMIT + 1)
  return {
    deposits: rows.slice(0, LIMIT).map(toDirectoryDeposit),
    truncated: rows.length > LIMIT,
  }
}

export async function listAdminDeposits(
  actor: AuthUser
): Promise<{ deposits: DirectoryDeposit[]; truncated: boolean }> {
  if (!canAccessGvbAdmin(actor.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace opérateur uniquement.")
  }
  return load({}, NETWORK)
}

export async function listPartnerDeposits(
  actor: AuthUser
): Promise<{ deposits: DirectoryDeposit[]; truncated: boolean }> {
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId) || !actor.partnerId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Espace partenaire uniquement."
    )
  }
  return load({ partnerId: actor.partnerId }, PARTNER)
}
