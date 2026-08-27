import "server-only"

import { AppError, ErrorCode } from "@/platform/errors"

import { getCurrentUser } from "./get-current-user"
import type { AuthUser } from "./types"

export async function requireActor(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError(
      ErrorCode.UNAUTHENTICATED,
      401,
      "Connectez-vous pour continuer."
    )
  }
  return user
}
