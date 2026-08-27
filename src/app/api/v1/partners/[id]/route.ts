import { requireActor } from "@/modules/auth"
import { deletePartner } from "@/modules/partners"
import { jsonData, jsonError } from "@/platform/http"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await deletePartner(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
