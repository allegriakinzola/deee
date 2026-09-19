import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import { deleteCatalogItemRecord, findCatalogItem } from "./repository"

export async function deleteCatalogItem(
  actor: AuthUser,
  catalogId: string,
  itemId: string
) {
  assertCanManageCatalogs(actor)

  const item = await findCatalogItem(catalogId, itemId)
  if (!item) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Cet article n’existe pas.")
  }

  await deleteCatalogItemRecord(itemId)
  return { id: itemId }
}
