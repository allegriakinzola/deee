import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManagePartners } from "./assert-manager"
import { findPartnerById, updatePartnerStatus } from "./repository"

const statusInputSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
})

export async function setPartnerStatus(
  actor: AuthUser,
  partnerId: string,
  input: unknown
) {
  assertCanManagePartners(actor)

  const parsed = statusInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez si le partenaire est actif ou désactivé."
    )
  }

  const partner = await findPartnerById(partnerId)
  if (!partner) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce partenaire n’existe pas.")
  }

  await updatePartnerStatus(partnerId, parsed.data.status)

  return { id: partnerId, status: parsed.data.status }
}
