import "server-only"

import { normalizeShopCode } from "@/lib/shop-code"
import { rewardsForKind } from "@/lib/redeem-rewards"
import type { AuthUser } from "@/modules/auth"
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

  return {
    shopName: shop.name,
    shopCode: shop.code,
    partnerName: shop.partner.name,
    partnerKind: shop.partner.kind,
    rewards: rewardsForKind(shop.partner.kind),
  }
}
