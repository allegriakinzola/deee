import "server-only"

import type { AuthUser } from "@/modules/auth"
import { DEFAULT_USD_PER_POINT } from "@/modules/catalog"

import { assertCanManageMaterials } from "./assert-manager"
import type { DirectoryMaterial } from "./contract"
import { toDirectoryMaterial } from "./present"
import { listMaterials } from "./repository"

export async function listDirectoryMaterials(
  actor: AuthUser
): Promise<DirectoryMaterial[]> {
  assertCanManageMaterials(actor)
  const rows = await listMaterials()
  return rows.map((row) => toDirectoryMaterial(row, DEFAULT_USD_PER_POINT))
}
