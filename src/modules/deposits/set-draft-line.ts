import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { getActiveMaterial } from "@/modules/materials"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCitizen } from "./assert-citizen"
import type { DirectoryDeposit } from "./contract"
import { getCitizenDraft } from "./get-citizen-draft"
import { toDirectoryDeposit } from "./present"
import { findDepositById, upsertDraftLine } from "./repository"

const inputSchema = z.object({
  materialId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(99),
})

export async function setDraftLine(
  actor: AuthUser,
  input: unknown
): Promise<DirectoryDeposit> {
  assertCitizen(actor)
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez le matériel et la quantité."
    )
  }

  const draft = await getCitizenDraft(actor)
  const material = await getActiveMaterial(parsed.data.materialId)
  if (!material || material.status !== "ACTIVE") {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Ce matériel n’est plus accepté."
    )
  }

  await upsertDraftLine({
    depositId: draft.id,
    materialId: material.id,
    quantity: parsed.data.quantity,
    pointsEach: material.points,
    name: material.name,
    category: material.category,
    image: material.image,
  })

  const updated = await findDepositById(draft.id)
  if (!updated) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce dépôt n’existe pas.")
  }
  return toDirectoryDeposit(updated)
}
