import "server-only"

import { formatDateTimeKinshasa, formatLongDateUtc, lastUtcDays } from "@/lib/period"
import { displayShopCode } from "@/lib/shop-code"
import { canAccessShopSpace } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { getShopDashboard } from "./get-shop-dashboard"
import { renderShopActivityReportPdf } from "./render-activity-report-pdf"
import { findShopById } from "./repository"

export type ShopActivityReportFile = {
  filename: string
  bytes: Uint8Array
}

export async function buildShopActivityReport(
  actor: AuthUser
): Promise<ShopActivityReportFile> {
  if (!canAccessShopSpace(actor.role, actor.shopId) || !actor.shopId) {
    throw new AppError(ErrorCode.FORBIDDEN, 403, "Espace shop uniquement.")
  }

  const shop = await findShopById(actor.shopId)
  if (!shop) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce shop n’existe pas.")
  }

  const data = await getShopDashboard(actor)
  const days = lastUtcDays(30)
  const periodStart = days[0] ?? ""
  const periodEnd = days[days.length - 1] ?? ""

  const bytes = await renderShopActivityReportPdf({
    shopName: shop.name,
    shopCode: displayShopCode(shop.code),
    shopArea: shop.area,
    shopStatus: shop.status === "ACTIVE" ? "Actif" : "Suspendu",
    partnerName: shop.partner.name,
    generatedBy: actor.displayName,
    generatedAt: formatDateTimeKinshasa(new Date()),
    periodStart: formatLongDateUtc(periodStart),
    periodEnd: formatLongDateUtc(periodEnd),
    data,
  })

  return {
    filename: `rapport-shop-${safeFilePart(shop.slug)}-${periodEnd}.pdf`,
    bytes,
  }
}

function safeFilePart(value: string): string {
  const compact = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return compact || "shop"
}
