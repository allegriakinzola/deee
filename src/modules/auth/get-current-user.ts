import "server-only"

import { readSessionToken } from "./session-cookie"
import { findUserBySessionToken } from "./session-store"
import type { AuthUser } from "./types"

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await readSessionToken()
  if (!token) {
    return null
  }
  return findUserBySessionToken(token)
}
