import { requireActor } from "@/modules/auth"
import { setShopStatus } from "@/modules/shops"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await setShopStatus(actor, id, await readJsonBody(request))
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
