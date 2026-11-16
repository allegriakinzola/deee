import { requireActor } from "@/modules/auth"
import { createPartnerOffer } from "@/modules/partners"
import { formFileBytes, formString, jsonData, jsonError } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const actor = await requireActor()
    const form = await request.formData()
    const result = await createPartnerOffer(
      actor,
      { label: formString(form, "label") },
      await formFileBytes(form, "image")
    )
    return jsonData(result, 201)
  } catch (error) {
    return jsonError(error)
  }
}
