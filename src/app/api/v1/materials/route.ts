import { requireActor } from "@/modules/auth"
import { createMaterial } from "@/modules/materials"
import { formFileBytes, formString, jsonData, jsonError } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const actor = await requireActor()
    const form = await request.formData()
    const result = await createMaterial(
      actor,
      {
        category: formString(form, "category"),
        name: formString(form, "name"),
        points: formString(form, "points"),
        remarks: formString(form, "remarks") || undefined,
      },
      await formFileBytes(form, "image")
    )
    return jsonData(result, 201)
  } catch (error) {
    return jsonError(error)
  }
}
