import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { shopAreaSchema } from "./area"
import { assertCanManageOwnShops } from "./assert-manager"
import {
  findShopById,
  findShopByPartnerSlug,
  updateShopRecord,
} from "./repository"
import { slugifyShopName } from "./slug"

const updateInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  area: shopAreaSchema,
  lat: z.coerce.number().gte(-90).lte(90),
  lng: z.coerce.number().gte(-180).lte(180),
})

export async function updateShop(
  actor: AuthUser,
  shopId: string,
  input: unknown
) {
  const partnerId = assertCanManageOwnShops(actor)

  const parsed = updateInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez le nom, la commune et la position du shop."
    )
  }

  const shop = await findShopById(shopId)
  if (!shop || shop.partnerId !== partnerId) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce shop n’existe pas.")
  }

  const slug = slugifyShopName(parsed.data.name)
  const clash = await findShopByPartnerSlug(partnerId, slug)
  if (clash && clash.id !== shop.id) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Un shop avec ce nom existe déjà."
    )
  }

  await updateShopRecord(shop.id, {
    name: parsed.data.name,
    slug,
    area: parsed.data.area,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  })

  return { id: shop.id }
}
