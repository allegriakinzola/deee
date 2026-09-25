import { requireActor } from "@/modules/auth"
import { sendCitizenRedeem } from "@/modules/redeems"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const actor = await requireActor()
    const result = await sendCitizenRedeem(actor, await readJsonBody(request))
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
