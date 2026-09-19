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
  createMaterialRecord,
  deleteMaterialRecord,
  findMaterialByName,
  updateMaterialRecord,
} from "./repository"

const createInputSchema = z.object({
  category: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(80),
  points: z.coerce.number().int().min(1).max(100000),
  remarks: z.string().trim().max(280).optional(),
})

export async function createMaterial(
  actor: AuthUser,
  input: unknown,
  imageBytes?: Buffer | null
): Promise<DirectoryMaterial> {
  assertCanManageMaterials(actor)

  const parsed = createInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez la catégorie, le nom du matériel et les points."
    )
  }

  if (!imageBytes || imageBytes.length === 0) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Ajoutez une image du matériel."
    )
  }

  if (!isCatalogGroup(parsed.data.category)) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Choisissez une catégorie.")
  }

  const taken = await findMaterialByName(parsed.data.category, parsed.data.name)
  if (taken) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Ce matériel existe déjà dans cette catégorie."
    )
  }

  const material = await createMaterialRecord({
    category: parsed.data.category,
    name: parsed.data.name,
    image: "",
    unit: "Pièce",
    points: parsed.data.points,
    remarks: parsed.data.remarks || null,
  })

  try {
    const image = await persistMaterialImage({
      materialId: material.id,
      bytes: imageBytes,
      previousImage: null,
    })
    const saved = await updateMaterialRecord(material.id, { image })
    return toDirectoryMaterial(saved, DEFAULT_USD_PER_POINT)
  } catch (error) {
    await deleteMaterialRecord(material.id)
    throw error
  }
}
