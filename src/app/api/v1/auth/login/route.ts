import { loginWithPassword, writeSessionCookie } from "@/modules/auth"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const result = await loginWithPassword(await readJsonBody(request))
    await writeSessionCookie(result.token, result.expiresAt)
    return jsonData({
      user: result.user,
      redirectTo: result.redirectTo,
    })
  } catch (error) {
    return jsonError(error)
  }
}
