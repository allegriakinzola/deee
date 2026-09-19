import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { parsePositiveDecimal } from "@/platform/decimal"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManageSettings } from "./assert-manager"
import type { OperatorSettings } from "./contract"
import { toOperatorSettings } from "./present"
import { updateOperatorSettingsRecord } from "./repository"

const updateInputSchema = z.object({
  bonUsdValue: z.union([z.string(), z.number()]),
})

export async function updateOperatorSettings(
  actor: AuthUser,
  input: unknown
): Promise<OperatorSettings> {
  assertCanManageSettings(actor)

  const parsed = updateInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez la valeur d’un bon en USD."
    )
  }

  const bonUsdValue = parsePositiveDecimal(parsed.data.bonUsdValue, 2)
  if (!bonUsdValue || Number(bonUsdValue) < 1) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Un bon doit valoir au moins 1 USD."
    )
  }

  const settings = await updateOperatorSettingsRecord(bonUsdValue)
  return toOperatorSettings(settings)
}
