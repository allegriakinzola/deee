import { NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE_NAME } from "@/platform/session"

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)
  if (hasSession) {
    return NextResponse.next()
  }

  const login = new URL("/connexion", request.url)
  login.searchParams.set("next", request.nextUrl.pathname)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/partenaire/:path*",
    "/shop/:path*",
    "/compte/:path*",
  ],
}
