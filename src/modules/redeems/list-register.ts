import "server-only"

import type { RedeemStatus } from "@/generated/prisma/client"
import { canAccessGvbAdmin, canAccessPartnerAdmin } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import type { DirectoryRedeem } from "./contract"
import { toDirectoryRedeem } from "./present"
import {
  countScopedRedeems,
  countScopedRedeemsByStatus,
  listScopedRedeemsPage,
} from "./repository"

export const REDEEM_PAGE_SIZE = 20

const STATUSES: RedeemStatus[] = ["SENT", "CONFIRMED", "REJECTED"]

export type RedeemStatusFilter = "ALL" | RedeemStatus

export type RedeemRegisterQuery = {
  page: number
  status: RedeemStatusFilter
  q: string
}

export type RedeemRegisterResult = {
  redeems: DirectoryRedeem[]
  page: number
  pageSize: number
  total: number
  pageCount: number
  q: string
  status: RedeemStatusFilter
  counts: Record<RedeemStatusFilter, number>
}

const EMPTY_COUNTS: Record<RedeemStatusFilter, number> = {
  ALL: 0,
  SENT: 0,
  CONFIRMED: 0,
  REJECTED: 0,
}

export function readRedeemQuery(input: {
  page?: string
  status?: string
  q?: string
}): RedeemRegisterQuery {
  const status = STATUSES.includes(input.status as RedeemStatus)
    ? (input.status as RedeemStatus)
    : "ALL"
  const parsed = Number(input.page)
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1
  const q = (input.q ?? "").trim().slice(0, 80)
  return { page, status, q }
}

async function load(
  scope: { partnerId?: string },
  query: RedeemRegisterQuery
): Promise<RedeemRegisterResult> {
  const selected = query.status === "ALL" ? STATUSES : [query.status]
  const [total, grouped] = await Promise.all([
    countScopedRedeems(scope, selected, query.q),
    countScopedRedeemsByStatus(scope, STATUSES, query.q),
  ])
  const pageCount = Math.max(1, Math.ceil(total / REDEEM_PAGE_SIZE))
  const page = Math.min(query.page, pageCount)
  const rows = await listScopedRedeemsPage(scope, selected, {
    skip: (page - 1) * REDEEM_PAGE_SIZE,
    take: REDEEM_PAGE_SIZE,
    q: query.q,
  })
  const counts = { ...EMPTY_COUNTS }
  for (const row of grouped) {
    counts[row.status] = row._count._all
    counts.ALL += row._count._all
  }
  return {
    redeems: rows.map(toDirectoryRedeem),
    page,
    pageSize: REDEEM_PAGE_SIZE,
    total,
    pageCount,
    q: query.q,
    status: query.status,
    counts,
  }
}

export async function listAdminRedeems(
  actor: AuthUser,
  query: RedeemRegisterQuery
): Promise<RedeemRegisterResult> {
  if (!canAccessGvbAdmin(actor.role)) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace opérateur uniquement.")
  }
  return load({}, query)
}

export async function listPartnerRedeems(
  actor: AuthUser,
  query: RedeemRegisterQuery
): Promise<RedeemRegisterResult> {
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId) || !actor.partnerId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Espace partenaire uniquement."
    )
  }
  return load({ partnerId: actor.partnerId }, query)
}
