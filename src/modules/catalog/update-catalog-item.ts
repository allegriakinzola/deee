import "server-only"

import { z } from "zod"

import { isCatalogGroup } from "@/lib/catalog-categories"
import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import type { DirectoryCatalogItem } from "./contract"
import { toDirectoryCatalogItem } from "./present"
import {
  findCatalogById,
  findCatalogItem,
  findCatalogItemByName,
  updateCatalogItemRecord,
} from "./repository"

const updateItemSchema = z.object({
  category: z.string().trim().min(2).max(80).optional(),
  name: z.string().trim().min(2).max(80).optional(),
  points: z.coerce.number().int().min(1).max(100000).optional(),
  remarks: z.string().trim().max(280).nullable().optional(),
})

export async function updateCatalogItem(
  actor: AuthUser,
  catalogId: string,
  itemId: string,
  input: unknown
): Promise<DirectoryCatalogItem> {
  assertCanManageCatalogs(actor)

  const parsed = updateItemSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Données de matériel invalides.")
  }

  const catalog = await findCatalogById(catalogId)
  if (!catalog) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce catalogue n’existe pas.")
  }

  const existing = await findCatalogItem(catalogId, itemId)
  if (!existing) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce matériel n’existe pas.")
  }

  const category = parsed.data.category ?? existing.category
  const name = parsed.data.name ?? existing.name

  if (!isCatalogGroup(category)) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Choisissez une catégorie du barème."
    )
  }

  const taken = await findCatalogItemByName(catalogId, category, name)
  if (taken && taken.id !== itemId) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Ce matériel existe déjà dans cette catégorie."
    )
  }

  const item = await updateCatalogItemRecord(itemId, {
    category,
    name,
    points: parsed.data.points,
    remarks:
      parsed.data.remarks === undefined
        ? undefined
        : parsed.data.remarks || null,
  })

  return toDirectoryCatalogItem(item, catalog.usdPerPoint.toString())
}
