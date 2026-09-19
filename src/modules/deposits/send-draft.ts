import "server-only"

import { z } from "zod"

import { normalizeShopCode } from "@/lib/shop-code"
import type { AuthUser } from "@/modules/auth"
import { findActiveShopByCode } from "@/modules/shops"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCitizen } from "./assert-citizen"
import type { DirectoryDeposit } from "./contract"
import { getCitizenDraft } from "./get-citizen-draft"
import { toDirectoryDeposit } from "./present"
import { sendDraftRecord } from "./repository"

const inputSchema = z.object({
  shopCode: z.string().trim().min(4).max(12),
})

export async function sendDraftToShop(
  actor: AuthUser,
  input: unknown
): Promise<DirectoryDeposit> {
  assertCitizen(actor)
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Saisissez le code du shop indiqué par le responsable."
    )
  }

  const draft = await getCitizenDraft(actor)
  const hasItems = draft.lines.some((line) => line.quantity > 0)
  if (!hasItems) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Ajoutez au moins un matériel avant d’envoyer."
    )
  }

  const shop = await findActiveShopByCode(normalizeShopCode(parsed.data.shopCode))
  if (!shop) {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Aucun shop actif ne correspond à ce code."
    )
  }

  const sent = await sendDraftRecord({
    depositId: draft.id,
    shopId: shop.id,
  })
  if (!sent) {
    throw new AppError(
      ErrorCode.VALIDATION,
      409,
      "Cette liste a déjà été envoyée."
    )
  }
  return toDirectoryDeposit(sent)
}
