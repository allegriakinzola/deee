import "server-only"

import { clearSessionCookie, readSessionToken } from "./session-cookie"
import { revokeSessionToken } from "./session-store"

export async function logoutCurrentSession(): Promise<void> {
  const token = await readSessionToken()
  if (token) {
    await revokeSessionToken(token)
  }
  await clearSessionCookie()
}
