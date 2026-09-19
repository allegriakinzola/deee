import "server-only"

import { canAccessCitizenSpace, canAccessShopSpace } from "@/modules/access"
import type { AuthUser } from "@/modules/auth"
import { DEFAULT_USD_PER_POINT } from "@/modules/catalog"
import { AppError, ErrorCode } from "@/platform/errors"

import type { DirectoryMaterial } from "./contract"
import { toDirectoryMaterial } from "./present"
import { findMaterialById, listActiveMaterials } from "./repository"

export async function getActiveMaterial(id: string) {
  const material = await findMaterialById(id)
  if (!material || material.status !== "ACTIVE") {
    return null
  }
  return material
}

export async function listPickupMaterials(
  actor: AuthUser
): Promise<DirectoryMaterial[]> {
  const allowed =
    canAccessCitizenSpace(actor.role) ||
    canAccessShopSpace(actor.role, actor.shopId)
  if (!allowed) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      403,
      "Vous ne pouvez pas consulter les matériels."
    )
  }
  const rows = await listActiveMaterials()
  return rows.map((row) => toDirectoryMaterial(row, DEFAULT_USD_PER_POINT))
}
