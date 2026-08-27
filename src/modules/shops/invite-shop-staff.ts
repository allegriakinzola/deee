import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { sendInvitationEmail } from "@/modules/notify"
import { provisionInvitedUser } from "@/modules/users"
import { AppError, ErrorCode, isAppError } from "@/platform/errors"
import { normalizeEmail } from "@/platform/email"

import { assertCanManageOwnShops } from "./assert-manager"
import type { ShopInvitationResult } from "./contract"
import {
  deletePendingOperator,
  ensureShopMembership,
  findShopById,
  findUserByEmailWithShop,
} from "./repository"

const inviteInputSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().min(3),
})

export async function inviteShopStaff(
  actor: AuthUser,
  shopId: string,
  input: unknown
): Promise<ShopInvitationResult> {
  const partnerId = assertCanManageOwnShops(actor)

  const shop = await findShopById(shopId)
  if (!shop || shop.partnerId !== partnerId) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce shop n’existe pas.")
  }

  const parsed = inviteInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez le nom et l’e-mail du responsable."
    )
  }

  const email = normalizeEmail(parsed.data.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Indiquez un e-mail valide.")
  }

  if (email === actor.email) {
    throw new AppError(
      ErrorCode.SELF_ACTION,
      400,
      "Vous ne pouvez pas vous attribuer le compte du shop."
    )
  }

  const current = shop.membership?.user
  if (current?.credential) {
    throw new AppError(
      ErrorCode.EMAIL_TAKEN,
      409,
      "Ce shop a déjà un compte actif."
    )
  }

  const existing = await findUserByEmailWithShop(email)
  if (existing?.shopMembership && existing.shopMembership.shopId !== shop.id) {
    throw new AppError(
      ErrorCode.EMAIL_TAKEN,
      409,
      "Cet e-mail est déjà le compte d’un autre shop."
    )
  }

  const currentEmail =
    current?.identities.find((identity) => identity.type === "EMAIL")?.value ??
    null
  if (current && !current.credential && currentEmail && currentEmail !== email) {
    await deletePendingOperator(current.id, actor.id)
  }

  const displayName = parsed.data.displayName
  const provisioned = await provisionInvitedUser({
    displayName,
    email,
    role: "SHOP_STAFF",
    invitedById: actor.id,
  })

  const after = await findUserByEmailWithShop(email)
  if (after?.shopMembership && after.shopMembership.shopId !== shop.id) {
    throw new AppError(
      ErrorCode.EMAIL_TAKEN,
      409,
      "Cet e-mail est déjà le compte d’un autre shop."
    )
  }

  await ensureShopMembership({
    shopId: shop.id,
    userId: provisioned.userId,
  })

  let emailed = true
  try {
    await sendInvitationEmail({
      to: email,
      displayName,
      roleLabel: `responsable ${shop.name}`,
      invitationUrl: provisioned.invitationUrl,
      invitedByName: actor.displayName,
    })
  } catch (error) {
    if (isAppError(error) && error.code === ErrorCode.MAIL_FAILED) {
      emailed = false
    } else {
      throw error
    }
  }

  return {
    email,
    invitationUrl: provisioned.invitationUrl,
    expiresAt: provisioned.expiresAt.toISOString(),
    emailed,
  }
}
