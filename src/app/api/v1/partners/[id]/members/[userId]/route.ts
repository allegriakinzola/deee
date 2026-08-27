import { requireActor } from "@/modules/auth"
import { deletePartnerMember } from "@/modules/partners"
import { jsonData, jsonError } from "@/platform/http"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const actor = await requireActor()
    const { id, userId } = await context.params
    const result = await deletePartnerMember(actor, id, userId)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
