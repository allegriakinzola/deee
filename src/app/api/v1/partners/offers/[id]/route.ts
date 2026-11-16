import { requireActor } from "@/modules/auth"
import { deletePartnerOffer, updatePartnerOffer } from "@/modules/partners"
import { formFileBytes, formString, jsonData, jsonError } from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const form = await request.formData()
    const result = await updatePartnerOffer(
      actor,
      id,
      { label: formString(form, "label") },
      await formFileBytes(form, "image"),
      formString(form, "removeImage") === "1"
    )
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await deletePartnerOffer(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
