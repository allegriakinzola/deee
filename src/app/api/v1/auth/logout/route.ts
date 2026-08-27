import { logoutCurrentSession } from "@/modules/auth"
import { jsonData, jsonError } from "@/platform/http"

export async function POST() {
  try {
    await logoutCurrentSession()
    return jsonData({ ok: true })
  } catch (error) {
    return jsonError(error)
  }
}
