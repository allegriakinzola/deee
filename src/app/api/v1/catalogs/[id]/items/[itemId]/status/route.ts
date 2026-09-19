import { requireActor } from "@/modules/auth"
import { setCatalogItemStatus } from "@/modules/catalog"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const actor = await requireActor()
    const { id, itemId } = await context.params
    const result = await setCatalogItemStatus(
      actor,
      id,
      itemId,
      await readJsonBody(request)
    )
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
