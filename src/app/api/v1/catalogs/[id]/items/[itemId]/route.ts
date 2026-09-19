import { requireActor } from "@/modules/auth"
import { deleteCatalogItem, updateCatalogItem } from "@/modules/catalog"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const actor = await requireActor()
    const { id, itemId } = await context.params
    const result = await updateCatalogItem(
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const actor = await requireActor()
    const { id, itemId } = await context.params
    const result = await deleteCatalogItem(actor, id, itemId)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
