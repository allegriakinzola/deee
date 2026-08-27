import "server-only"

import { z } from "zod"

import { AppError, ErrorCode } from "@/platform/errors"
import { absoluteUrl } from "@/platform/site-url"

import { findUserByIdentifier, parseIdentifier } from "@/modules/identity"
import { homePathFor } from "@/modules/access"
import { verifyPassword } from "./password"
import { createSession, toAuthUser } from "./session-store"
import type { AuthUser } from "./types"

const loginInputSchema = z.object({
  identifier: z.string(),
  password: z.string(),
})

export type LoginResult = {
  user: AuthUser
  token: string
  expiresAt: Date
  redirectTo: string
}

export async function loginWithPassword(input: unknown): Promise<LoginResult> {
  const parsed = loginInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez votre e-mail et votre mot de passe."
    )
  }

  const identifier = parseIdentifier(parsed.data.identifier)
  const user = await findUserByIdentifier(identifier)
  const passwordOk = await verifyPassword(
    parsed.data.password,
    user?.credential?.passwordHash ?? null
  )

  if (!user || !passwordOk) {
    throw new AppError(
      ErrorCode.INVALID_CREDENTIALS,
      401,
      "E-mail ou mot de passe incorrect."
    )
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(
      ErrorCode.ACCOUNT_DISABLED,
      403,
      "Ce compte est désactivé."
    )
  }

  const session = await createSession(user.id)

  return {
    user: toAuthUser(user),
    token: session.token,
    expiresAt: session.expiresAt,
    redirectTo: absoluteUrl(homePathFor(user.role)),
  }
}
