import { z } from "zod"

import { AppError, ErrorCode } from "@/platform/errors"

const labelSchema = z.string().trim().min(2).max(80)

export function parseOfferLabel(input: unknown): string {
  const parsed = labelSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez un libellé d’offre, entre 2 et 80 caractères."
    )
  }
  return parsed.data
}

export function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}
