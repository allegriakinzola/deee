import { requireActor } from "@/modules/auth"
import { deleteShop, updateShop } from "@/modules/shops"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await updateShop(actor, id, await readJsonBody(request))
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
    const result = await deleteShop(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
