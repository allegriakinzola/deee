import { requireActor } from "@/modules/auth"
import { createPartner } from "@/modules/partners"
import { formFileBytes, formString, jsonData, jsonError } from "@/platform/http"

export async function POST(request: Request) {
  try {
    const actor = await requireActor()
    const form = await request.formData()
    const adminDisplayName = formString(form, "adminDisplayName")
    const adminEmail = formString(form, "adminEmail")
    const result = await createPartner(
      actor,
      {
        name: formString(form, "name"),
        shortName: formString(form, "shortName"),
        kind: formString(form, "kind"),
        admin:
          adminDisplayName || adminEmail
            ? { displayName: adminDisplayName, email: adminEmail }
            : undefined,
      },
      await formFileBytes(form, "logo")
    )
    return jsonData(result, 201)
  } catch (error) {
    return jsonError(error)
  }
}
