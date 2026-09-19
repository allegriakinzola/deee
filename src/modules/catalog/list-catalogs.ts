import "server-only"

import type { AuthUser } from "@/modules/auth"
import { readBonUsdValue } from "@/modules/settings"

import { assertCanManageCatalogs } from "./assert-manager"
import type { DirectoryCatalog } from "./contract"
import { toDirectoryCatalog } from "./present"
import { listCatalogsWithCounts } from "./repository"

export async function listDirectoryCatalogs(
  actor: AuthUser
): Promise<DirectoryCatalog[]> {
  assertCanManageCatalogs(actor)
  const [catalogs, bonUsdValue] = await Promise.all([
    listCatalogsWithCounts(),
    readBonUsdValue(),
  ])
  return catalogs.map((catalog) => toDirectoryCatalog(catalog, bonUsdValue))
}
