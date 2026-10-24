export const ErrorCode = {
  VALIDATION: "VALIDATION",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNSUPPORTED_IDENTIFIER: "UNSUPPORTED_IDENTIFIER",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  EMAIL_TAKEN: "EMAIL_TAKEN",
  NAME_TAKEN: "NAME_TAKEN",
  INVITATION_INVALID: "INVITATION_INVALID",
  LAST_ADMIN: "LAST_ADMIN",
  SELF_ACTION: "SELF_ACTION",
  MAIL_FAILED: "MAIL_FAILED",
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number

  constructor(code: ErrorCode, status: number, message: string) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = status
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function appErrorFromUnknown(error: unknown): AppError | null {
  if (isAppError(error)) {
    return error
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Un enregistrement avec cette valeur existe déjà."
    )
  }
  return null
}
