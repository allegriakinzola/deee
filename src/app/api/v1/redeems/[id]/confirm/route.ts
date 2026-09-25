import { requireActor } from "@/modules/auth"
import { confirmShopRedeem } from "@/modules/redeems"
import { jsonData, jsonError } from "@/platform/http"

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await confirmShopRedeem(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
