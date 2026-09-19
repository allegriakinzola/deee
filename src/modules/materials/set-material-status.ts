import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageMaterials } from "./assert-manager"
import { findMaterialById, updateMaterialStatus } from "./repository"

const statusInputSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
})

export async function setMaterialStatus(
  actor: AuthUser,
  materialId: string,
  input: unknown
) {
  assertCanManageMaterials(actor)

  const parsed = statusInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez si le matériel est actif ou désactivé."
    )
  }

  const material = await findMaterialById(materialId)
  if (!material) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce matériel n’existe pas.")
  }

  await updateMaterialStatus(materialId, parsed.data.status)
  return { id: materialId, status: parsed.data.status }
}
