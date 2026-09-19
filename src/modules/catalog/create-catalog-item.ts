import "server-only"

import { z } from "zod"

import { isCatalogGroup } from "@/lib/catalog-categories"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import type { DirectoryCatalogItem } from "./contract"
import { toDirectoryCatalogItem } from "./present"
import {
  createCatalogItemRecord,
  findCatalogById,
  findCatalogItemByName,
} from "./repository"

const itemInputSchema = z.object({
  category: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(80),
  points: z.coerce.number().int().min(1).max(100000),
  remarks: z.string().trim().max(280).optional(),
})

export async function createCatalogItem(
  actor: AuthUser,
  catalogId: string,
  input: unknown
): Promise<DirectoryCatalogItem> {
  assertCanManageCatalogs(actor)

  const parsed = itemInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez la catégorie, le nom du matériel et les points."
    )
  }

  if (!isCatalogGroup(parsed.data.category)) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Choisissez une catégorie du barème."
    )
  }

  const catalog = await findCatalogById(catalogId)
  if (!catalog) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce catalogue n’existe pas.")
  }

  const taken = await findCatalogItemByName(
    catalogId,
    parsed.data.category,
    parsed.data.name
  )
  if (taken) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Ce matériel existe déjà dans cette catégorie."
    )
  }

  const item = await createCatalogItemRecord({
    catalogId,
    category: parsed.data.category,
    name: parsed.data.name,
    description: null,
    unit: "Pièce",
    points: parsed.data.points,
    remarks: parsed.data.remarks || null,
  })

  return toDirectoryCatalogItem(item, catalog.usdPerPoint.toString())
}
