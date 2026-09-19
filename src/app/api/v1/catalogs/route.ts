import { requireActor } from "@/modules/auth"
import { createCatalog } from "@/modules/catalog"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const actor = await requireActor()
    const result = await createCatalog(actor, await readJsonBody(request))
    return jsonData(result, 201)
  } catch (error) {
    return jsonError(error)
  }
}
