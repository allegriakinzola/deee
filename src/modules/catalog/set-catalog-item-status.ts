import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import { findCatalogItem, updateCatalogItemStatus } from "./repository"

const statusInputSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
})

export async function setCatalogItemStatus(
  actor: AuthUser,
  catalogId: string,
  itemId: string,
  input: unknown
) {
  assertCanManageCatalogs(actor)

  const parsed = statusInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez si l’article est actif ou désactivé."
    )
  }

  const item = await findCatalogItem(catalogId, itemId)
  if (!item) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Cet article n’existe pas.")
  }

  await updateCatalogItemStatus(itemId, parsed.data.status)
  return { id: itemId, status: parsed.data.status }
}
