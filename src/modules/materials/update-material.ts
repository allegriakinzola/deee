import "server-only"

import { z } from "zod"

import { isCatalogGroup } from "@/lib/catalog-categories"
import type { AuthUser } from "@/modules/auth"
import { DEFAULT_USD_PER_POINT } from "@/modules/catalog"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageMaterials } from "./assert-manager"
import type { DirectoryMaterial } from "./contract"
import { persistMaterialImage } from "./persist-image"
import { toDirectoryMaterial } from "./present"
import {
  findMaterialById,
  findMaterialByName,
  updateMaterialRecord,
} from "./repository"

const updateInputSchema = z.object({
  category: z.string().trim().min(2).max(80).optional(),
  name: z.string().trim().min(2).max(80).optional(),
  points: z.coerce.number().int().min(1).max(100000).optional(),
  remarks: z.string().trim().max(280).nullable().optional(),
})

export async function updateMaterial(
  actor: AuthUser,
  materialId: string,
  input: unknown,
  imageBytes?: Buffer | null
): Promise<DirectoryMaterial> {
  assertCanManageMaterials(actor)

  const parsed = updateInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Données de matériel invalides.")
  }

  const existing = await findMaterialById(materialId)
  if (!existing) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce matériel n’existe pas.")
  }

  const category = parsed.data.category ?? existing.category
  const name = parsed.data.name ?? existing.name

  if (!isCatalogGroup(category)) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Choisissez une catégorie.")
  }

  const taken = await findMaterialByName(category, name)
  if (taken && taken.id !== materialId) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Ce matériel existe déjà dans cette catégorie."
    )
  }

  let image: string | undefined
  if (imageBytes && imageBytes.length > 0) {
    image = await persistMaterialImage({
      materialId,
      bytes: imageBytes,
      previousImage: existing.image,
    })
  }

  const material = await updateMaterialRecord(materialId, {
    category,
    name,
    image,
    points: parsed.data.points,
    remarks:
      parsed.data.remarks === undefined
        ? undefined
        : parsed.data.remarks || null,
  })

  return toDirectoryMaterial(material, DEFAULT_USD_PER_POINT)
}
