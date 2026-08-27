import { requireActor } from "@/modules/auth"
import { setPartnerMemberStatus } from "@/modules/partners"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const actor = await requireActor()
    const { id, userId } = await context.params
    const result = await setPartnerMemberStatus(
      actor,
      id,
      userId,
      await readJsonBody(request)
    )
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
