import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"
import { removePublicUpload } from "@/platform/uploads"

import { assertCanManageMaterials } from "./assert-manager"
import { deleteMaterialRecord, findMaterialById } from "./repository"

export async function deleteMaterial(actor: AuthUser, materialId: string) {
  assertCanManageMaterials(actor)

  const material = await findMaterialById(materialId)
  if (!material) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce matériel n’existe pas.")
  }

  await deleteMaterialRecord(materialId)
  await removePublicUpload(material.image)
  return { id: materialId }
}
