import { requireActor } from "@/modules/auth"
import { setDraftLine } from "@/modules/deposits"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function PATCH(request: Request) {
  try {
    const actor = await requireActor()
    const result = await setDraftLine(actor, await readJsonBody(request))
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
