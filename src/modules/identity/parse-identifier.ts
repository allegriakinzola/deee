import { AppError, ErrorCode } from "@/platform/errors"

import { normalizeEmail } from "./normalize"

export type ParsedIdentifier =
  | { type: "EMAIL"; value: string }
  | { type: "PHONE"; value: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseIdentifier(raw: string): ParsedIdentifier {
  const trimmed = raw.trim()

  if (!trimmed) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez votre e-mail et votre mot de passe."
    )
  }

  if (EMAIL_PATTERN.test(trimmed)) {
    return { type: "EMAIL", value: normalizeEmail(trimmed) }
  }

  throw new AppError(
    ErrorCode.UNSUPPORTED_IDENTIFIER,
    400,
    "Pour l’instant, connectez-vous avec votre e-mail."
  )
}
