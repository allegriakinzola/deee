import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { readBonUsdValue } from "@/modules/settings"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import { parsePositiveDecimal, pointsPerBon } from "./conversion"
import type { DirectoryCatalog } from "./contract"
import { slugifyCatalogName } from "./defaults"
import { toDirectoryCatalog } from "./present"
import {
  findCatalogById,
  findCatalogBySlug,
  updateCatalogRecord,
} from "./repository"

const updateInputSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(280).nullable().optional(),
  usdPerPoint: z.union([z.string(), z.number()]).optional(),
})

export async function updateCatalog(
  actor: AuthUser,
  catalogId: string,
  input: unknown
): Promise<DirectoryCatalog> {
  assertCanManageCatalogs(actor)

  const parsed = updateInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Données de catalogue invalides.")
  }

  const catalog = await findCatalogById(catalogId)
  if (!catalog) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce catalogue n’existe pas.")
  }

  let slug: string | undefined
  if (parsed.data.name && parsed.data.name !== catalog.name) {
    slug = slugifyCatalogName(parsed.data.name)
    const taken = await findCatalogBySlug(slug)
    if (taken && taken.id !== catalogId) {
      throw new AppError(
        ErrorCode.NAME_TAKEN,
        409,
        "Un catalogue avec ce nom existe déjà."
      )
    }
  }

  const usdPerPoint = parsed.data.usdPerPoint
    ? parsePositiveDecimal(parsed.data.usdPerPoint, 4)
    : catalog.usdPerPoint.toString()
  const bonUsdValue = await readBonUsdValue()

  if (!usdPerPoint) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez un USD par point valide."
    )
  }

  if (pointsPerBon(usdPerPoint, bonUsdValue) < 1) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Un bon doit valoir au moins 1 point avec ce barème."
    )
  }

  const updated = await updateCatalogRecord(catalogId, {
    name: parsed.data.name,
    slug,
    description:
      parsed.data.description === undefined
        ? undefined
        : parsed.data.description || null,
    usdPerPoint,
  })

  return toDirectoryCatalog(
    {
      ...updated,
      _count: { items: catalog.items.length },
    },
    bonUsdValue
  )
}
