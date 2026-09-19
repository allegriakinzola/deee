import "server-only"

import type { AuthUser } from "@/modules/auth"
import { readBonUsdValue } from "@/modules/settings"

import { assertCanManageCatalogs } from "./assert-manager"
import type { DirectoryCatalogDetail } from "./contract"
import { toDirectoryCatalogDetail } from "./present"
import { findCatalogById } from "./repository"

export async function getDirectoryCatalog(
  actor: AuthUser,
  catalogId: string
): Promise<DirectoryCatalogDetail | null> {
  assertCanManageCatalogs(actor)

  const catalog = await findCatalogById(catalogId)
  if (!catalog) {
    return null
  }

  return toDirectoryCatalogDetail(catalog, await readBonUsdValue())
}
