import { requireActor } from "@/modules/auth"
import { deleteMaterial, updateMaterial } from "@/modules/materials"
import {
  formFileBytes,
  formString,
  jsonData,
  jsonError,
} from "@/platform/http"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const form = await request.formData()
    const remarks = form.get("remarks")
    const result = await updateMaterial(
      actor,
      id,
      {
        category: formString(form, "category") || undefined,
        name: formString(form, "name") || undefined,
        points: formString(form, "points") || undefined,
        remarks: typeof remarks === "string" ? remarks : undefined,
      },
      await formFileBytes(form, "image")
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
    const result = await deleteMaterial(actor, id)
    return jsonData(result)
  } catch (error) {
    return jsonError(error)
  }
}
