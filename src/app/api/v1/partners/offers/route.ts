import { requireActor } from "@/modules/auth"
import { createPartnerOffer } from "@/modules/partners"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const actor = await requireActor()
    const result = await createPartnerOffer(actor, await readJsonBody(request))
    return jsonData(result, 201)
  } catch (error) {
    return jsonError(error)
  }
}
