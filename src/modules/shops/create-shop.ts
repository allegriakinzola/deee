import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { shopAreaSchema } from "./area"
import { assertCanManageOwnShops } from "./assert-manager"
import type { ShopInvitationResult } from "./contract"
import { inviteShopStaff } from "./invite-shop-staff"
import { createShopRecord, findShopByPartnerSlug } from "./repository"
import { slugifyShopName } from "./slug"

const createInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  area: shopAreaSchema,
  lat: z.coerce.number().gte(-90).lte(90),
  lng: z.coerce.number().gte(-180).lte(180),
  operator: z
    .object({
      displayName: z.string().trim().min(2).max(80),
      email: z.string().trim().min(3),
    })
    .optional(),
})

export type CreateShopResult = {
  id: string
  name: string
  invitation: ShopInvitationResult | null
}

export async function createShop(
  actor: AuthUser,
  input: unknown
): Promise<CreateShopResult> {
  const partnerId = assertCanManageOwnShops(actor)

  const parsed = createInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez le nom, la commune et la position du shop."
    )
  }

  const slug = slugifyShopName(parsed.data.name)
  const existing = await findShopByPartnerSlug(partnerId, slug)
  if (existing) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Un shop avec ce nom existe déjà."
    )
  }

  const shop = await createShopRecord({
    partnerId,
    name: parsed.data.name,
    slug,
    area: parsed.data.area,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  })

  let invitation: ShopInvitationResult | null = null
  if (parsed.data.operator) {
    invitation = await inviteShopStaff(actor, shop.id, parsed.data.operator)
  }

  return {
    id: shop.id,
    name: shop.name,
    invitation,
  }
}
