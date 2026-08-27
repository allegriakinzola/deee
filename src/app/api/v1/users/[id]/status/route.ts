import { requireActor } from "@/modules/auth"
import { setUserStatus } from "@/modules/users"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await setUserStatus(actor, id, await readJsonBody(request))
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
