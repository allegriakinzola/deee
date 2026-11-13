import "server-only"

import { normalizeShopCode } from "@/lib/shop-code"
import type { AuthUser } from "@/modules/auth"
import { loadPartnerRedeemOffers } from "@/modules/partners"
import { readBonUsdValue } from "@/modules/settings"
import { findActiveShopByCode } from "@/modules/shops"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCitizen } from "./assert-citizen"
import type { ShopRedeemOffers } from "./contract"

export async function getShopRedeemOffers(
  actor: AuthUser,
  shopCode: string
): Promise<ShopRedeemOffers> {
  assertCitizen(actor)
  const shop = await findActiveShopByCode(normalizeShopCode(shopCode))
  if (!shop) {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Aucun shop actif ne correspond à ce code."
    )
  }

  const [offers, bonUsdValue] = await Promise.all([
    loadPartnerRedeemOffers(shop.partner.id, shop.partner.rewardKind),
    readBonUsdValue(),
  ])
  const usd = Number(bonUsdValue)

  return {
    shopName: shop.name,
    shopCode: shop.code,
    partnerName: shop.partner.name,
    partnerKind: shop.partner.kind,
    rewardKind: shop.partner.rewardKind,
    rewards: offers.map((offer) => ({
      id: offer.id,
      label: offer.label,
      usd: Number.isFinite(usd) ? usd : 0,
    })),
  }
}
