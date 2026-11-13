import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { shopAreaSchema } from "./area"
import {
  KINSHASA_POSITION_ERROR,
  kinshasaPositionSchema,
} from "@/lib/coordinates"
import { assertCanManageOwnShops } from "./assert-manager"
import type { ShopInvitationResult } from "./contract"
import { inviteShopStaff } from "./invite-shop-staff"
import { createShopRecord, findShopByCode, findShopByPartnerSlug } from "./repository"
import { generateShopCode } from "./generate-code"
import { slugifyShopName } from "./slug"

const createInputSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    area: shopAreaSchema,
    lat: z.unknown(),
    lng: z.unknown(),
    operator: z
      .object({
        displayName: z.string().trim().min(2).max(80),
        email: z.string().trim().min(3),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    const position = kinshasaPositionSchema.safeParse({
      lat: value.lat,
      lng: value.lng,
    })
    if (!position.success) {
      ctx.addIssue({ code: "custom", message: KINSHASA_POSITION_ERROR })
    }
  })
  .transform((value) => {
    const position = kinshasaPositionSchema.parse({
      lat: value.lat,
      lng: value.lng,
    })
    return { ...value, ...position }
  })

export type CreateShopResult = {
  id: string
  name: string
  code: string
  invitation: ShopInvitationResult | null
}

export async function createShop(
  actor: AuthUser,
  input: unknown
): Promise<CreateShopResult> {
  const partnerId = assertCanManageOwnShops(actor)

  const parsed = createInputSchema.safeParse(input)
  if (!parsed.success) {
    const position = parsed.error.issues.some(
      (issue) => issue.message === KINSHASA_POSITION_ERROR
    )
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      position
        ? KINSHASA_POSITION_ERROR
        : "Indiquez le nom, la commune et la position du shop."
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

  let code = generateShopCode()
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const taken = await findShopByCode(code)
    if (!taken) {
      break
    }
    if (attempt === 7) {
      throw new AppError(
        ErrorCode.VALIDATION,
        500,
        "Impossible de générer un code shop unique. Réessayez."
      )
    }
    code = generateShopCode()
  }

  const shop = await createShopRecord({
    partnerId,
    name: parsed.data.name,
    slug,
    code,
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
    code: shop.code,
    invitation,
  }
}
