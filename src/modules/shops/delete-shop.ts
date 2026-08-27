import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageOwnShops } from "./assert-manager"
import {
  deletePendingOperator,
  deleteShopRecord,
  findShopById,
} from "./repository"

export async function deleteShop(actor: AuthUser, shopId: string) {
  const partnerId = assertCanManageOwnShops(actor)

  const shop = await findShopById(shopId)
  if (!shop || shop.partnerId !== partnerId) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce shop n’existe pas.")
  }

  const operatorId = shop.membership?.user.id
  await deleteShopRecord(shop.id)
  if (operatorId) {
    await deletePendingOperator(operatorId, actor.id)
  }

  return { id: shopId }
}
