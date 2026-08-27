import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageOwnShops } from "./assert-manager"
import { findShopById, updateShopStatus } from "./repository"

const statusInputSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
})

export async function setShopStatus(
  actor: AuthUser,
  shopId: string,
  input: unknown
) {
  const partnerId = assertCanManageOwnShops(actor)

  const parsed = statusInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Statut invalide.")
  }

  const shop = await findShopById(shopId)
  if (!shop || shop.partnerId !== partnerId) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce shop n’existe pas.")
  }

  await updateShopStatus(shop.id, parsed.data.status)
  return { id: shop.id, status: parsed.data.status }
}
