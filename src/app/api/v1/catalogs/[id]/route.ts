import { requireActor } from "@/modules/auth"
import { deleteCatalog, updateCatalog } from "@/modules/catalog"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await updateCatalog(actor, id, await readJsonBody(request))
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await deleteCatalog(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
