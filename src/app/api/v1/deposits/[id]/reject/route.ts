import { requireActor } from "@/modules/auth"
import { rejectShopDeposit } from "@/modules/deposits"
import { jsonData, jsonError } from "@/platform/http"

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await rejectShopDeposit(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
