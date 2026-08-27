import { requireActor } from "@/modules/auth"
import { setPartnerLogo } from "@/modules/partners"
import { formFileBytes, jsonData, jsonError } from "@/platform/http"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const form = await request.formData()
    const result = await setPartnerLogo(
      actor,
      id,
      await formFileBytes(form, "logo")
    )
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
