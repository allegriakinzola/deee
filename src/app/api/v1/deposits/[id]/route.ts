import { requireActor } from "@/modules/auth"
import { cancelCitizenDeposit } from "@/modules/deposits"
import { jsonData, jsonError } from "@/platform/http"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await cancelCitizenDeposit(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
