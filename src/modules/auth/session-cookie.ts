import "server-only"

import { cookies } from "next/headers"

import { isProduction } from "@/platform/env"

import { SESSION_COOKIE_NAME } from "./session-constants"

export async function readSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function writeSessionCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    expires: expiresAt,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}
