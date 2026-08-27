import { requireActor } from "@/modules/auth"
import { createShop } from "@/modules/shops"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const actor = await requireActor()
    const result = await createShop(actor, await readJsonBody(request))
    return jsonData(result, 201)
  } catch (error) {
    return jsonError(error)
  }
}
