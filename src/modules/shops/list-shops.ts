import "server-only"

import { canViewNetworkShops } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageOwnShops } from "./assert-manager"
import type { DirectoryShop } from "./contract"
import { toDirectoryShop } from "./map-shop"
import { listAllShops, listShopsForPartner } from "./repository"

export async function listPartnerShops(
  actor: AuthUser
): Promise<DirectoryShop[]> {
  const partnerId = assertCanManageOwnShops(actor)
  const shops = await listShopsForPartner(partnerId)
  return shops.map(toDirectoryShop)
}

export async function listNetworkShops(
  actor: AuthUser
): Promise<DirectoryShop[]> {
  if (!canViewNetworkShops(actor.role)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Seul un administrateur GVB peut consulter le réseau de shops."
    )
  }
  const shops = await listAllShops()
  return shops.map(toDirectoryShop)
}
