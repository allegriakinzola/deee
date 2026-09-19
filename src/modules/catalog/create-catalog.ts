import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { readBonUsdValue } from "@/modules/settings"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import {
  DEFAULT_USD_PER_POINT,
  parsePositiveDecimal,
  pointsPerBon,
} from "./conversion"
import type { DirectoryCatalog } from "./contract"
import { slugifyCatalogName } from "./defaults"
import { toDirectoryCatalog } from "./present"
import { createCatalogRecord, findCatalogBySlug } from "./repository"

const createInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(280).optional(),
  usdPerPoint: z.union([z.string(), z.number()]).optional(),
})

export async function createCatalog(
  actor: AuthUser,
  input: unknown
): Promise<DirectoryCatalog> {
  assertCanManageCatalogs(actor)

  const parsed = createInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez un nom de catalogue."
    )
  }

  const usdPerPoint =
    parsePositiveDecimal(
      parsed.data.usdPerPoint ?? DEFAULT_USD_PER_POINT,
      4
    ) ?? null
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

  const slug = slugifyCatalogName(parsed.data.name)
  const existing = await findCatalogBySlug(slug)
  if (existing) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Un catalogue avec ce nom existe déjà."
    )
  }

  const catalog = await createCatalogRecord({
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    usdPerPoint,
  })

  return toDirectoryCatalog({ ...catalog, _count: { items: 0 } }, bonUsdValue)
}
