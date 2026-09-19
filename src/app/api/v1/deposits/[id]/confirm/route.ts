import { requireActor } from "@/modules/auth"
import { confirmShopDeposit } from "@/modules/deposits"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await confirmShopDeposit(
      actor,
      id,
      await readJsonBody(request)
    )
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
