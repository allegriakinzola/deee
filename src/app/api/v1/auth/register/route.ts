import { registerCitizen } from "@/modules/users"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const result = await registerCitizen(await readJsonBody(request))
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
