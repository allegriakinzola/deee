import "server-only"

import { findShopByCode } from "./repository"

export async function findActiveShopByCode(code: string) {
  const shop = await findShopByCode(code)
  if (!shop || shop.status !== "ACTIVE" || shop.partner.status !== "ACTIVE") {
    return null
  }
  return shop
}
