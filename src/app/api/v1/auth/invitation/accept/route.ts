import {
  startSessionForUser,
  writeSessionCookie,
} from "@/modules/auth"
import { acceptInvitation } from "@/modules/users"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const accepted = await acceptInvitation(await readJsonBody(request))
    const session = await startSessionForUser(accepted.user.id)
    await writeSessionCookie(session.token, session.expiresAt)
    return jsonData({
      user: accepted.user,
      redirectTo: accepted.redirectTo,
    })
  } catch (error) {
    return jsonError(error)
  }
}
