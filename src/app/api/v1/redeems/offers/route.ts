import { requireActor } from "@/modules/auth"
import { getShopRedeemOffers } from "@/modules/redeems"
import { jsonData, jsonError } from "@/platform/http"

export async function GET(request: Request) {
  try {
    const actor = await requireActor()
    const shopCode = new URL(request.url).searchParams.get("shopCode") ?? ""
    const result = await getShopRedeemOffers(actor, shopCode)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
