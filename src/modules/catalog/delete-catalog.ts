import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import { deleteCatalogRecord, findCatalogById } from "./repository"

export async function deleteCatalog(actor: AuthUser, catalogId: string) {
  assertCanManageCatalogs(actor)

  const catalog = await findCatalogById(catalogId)
  if (!catalog) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce catalogue n’existe pas.")
  }

  await deleteCatalogRecord(catalogId)
  return { id: catalogId }
}
