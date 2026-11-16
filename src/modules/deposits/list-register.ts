import "server-only"

import type { DepositStatus } from "@/generated/prisma/client"
import { canAccessGvbAdmin, canAccessPartnerAdmin } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import type { DirectoryDeposit } from "./contract"
import { toDirectoryDeposit } from "./present"
import {
  countScopedDeposits,
  countScopedDepositsByStatus,
  listScopedDepositsPage,
} from "./repository"

export const DEPOSIT_PAGE_SIZE = 20

const NETWORK: DepositStatus[] = ["DRAFT", "SENT", "CONFIRMED", "REJECTED"]
const PARTNER: DepositStatus[] = ["SENT", "CONFIRMED", "REJECTED"]

export type DepositStatusFilter = "ALL" | DepositStatus

export type DepositRegisterQuery = {
  page: number
  status: DepositStatusFilter
  q: string
}

export type DepositRegisterResult = {
  deposits: DirectoryDeposit[]
  page: number
  pageSize: number
  total: number
  pageCount: number
  q: string
  status: DepositStatusFilter
  counts: Record<DepositStatusFilter, number>
}

const EMPTY_COUNTS: Record<DepositStatusFilter, number> = {
  ALL: 0,
  DRAFT: 0,
  SENT: 0,
  CONFIRMED: 0,
  REJECTED: 0,
}

export function readDepositQuery(
  input: { page?: string; status?: string; q?: string },
  allowDraft: boolean
): DepositRegisterQuery {
  const allowed = allowDraft ? NETWORK : PARTNER
  const status = allowed.includes(input.status as DepositStatus)
    ? (input.status as DepositStatus)
    : "ALL"
  const parsed = Number(input.page)
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1
  const q = (input.q ?? "").trim().slice(0, 80)
  return { page, status, q }
}

async function load(
  scope: { partnerId?: string },
  statuses: DepositStatus[],
  query: DepositRegisterQuery
): Promise<DepositRegisterResult> {
  const selected = query.status === "ALL" ? statuses : [query.status]
  const [total, grouped] = await Promise.all([
    countScopedDeposits(scope, selected, query.q),
    countScopedDepositsByStatus(scope, statuses, query.q),
  ])
  const pageCount = Math.max(1, Math.ceil(total / DEPOSIT_PAGE_SIZE))
  const page = Math.min(query.page, pageCount)
  const rows = await listScopedDepositsPage(scope, selected, {
    skip: (page - 1) * DEPOSIT_PAGE_SIZE,
    take: DEPOSIT_PAGE_SIZE,
    q: query.q,
  })
  const counts = { ...EMPTY_COUNTS }
  for (const row of grouped) {
    counts[row.status] = row._count._all
    counts.ALL += row._count._all
  }
  return {
    deposits: rows.map(toDirectoryDeposit),
    page,
    pageSize: DEPOSIT_PAGE_SIZE,
    total,
    pageCount,
    q: query.q,
    status: query.status,
    counts,
  }
}

export async function listAdminDeposits(
  actor: AuthUser,
  query: DepositRegisterQuery
): Promise<DepositRegisterResult> {
  if (!canAccessGvbAdmin(actor.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace opérateur uniquement.")
  }
  return load({}, NETWORK, query)
}

export async function listPartnerDeposits(
  actor: AuthUser,
  query: DepositRegisterQuery
): Promise<DepositRegisterResult> {
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId) || !actor.partnerId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Espace partenaire uniquement."
    )
  }
  return load({ partnerId: actor.partnerId }, PARTNER, query)
}
