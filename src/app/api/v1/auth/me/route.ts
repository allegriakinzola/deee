import { getCurrentUser } from "@/modules/auth"
import { jsonData, jsonError } from "@/platform/http"

export async function GET() {
  try {
    const user = await getCurrentUser()
    return jsonData({ user })
  } catch (error) {
    return jsonError(error)
  }
}
