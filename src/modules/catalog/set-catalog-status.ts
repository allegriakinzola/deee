import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageCatalogs } from "./assert-manager"
import { findCatalogById, updateCatalogStatus } from "./repository"

const statusInputSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
})

export async function setCatalogStatus(
  actor: AuthUser,
  catalogId: string,
  input: unknown
) {
  assertCanManageCatalogs(actor)

  const parsed = statusInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez si le catalogue est actif ou désactivé."
    )
  }

  const catalog = await findCatalogById(catalogId)
  if (!catalog) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce catalogue n’existe pas.")
  }

  await updateCatalogStatus(catalogId, parsed.data.status)
  return { id: catalogId, status: parsed.data.status }
}
