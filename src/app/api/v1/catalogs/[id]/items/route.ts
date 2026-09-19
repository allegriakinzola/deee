import { requireActor } from "@/modules/auth"
import { createCatalogItem } from "@/modules/catalog"
import { jsonData, jsonError, readJsonBody } from "@/platform/http"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireActor()
    const { id } = await context.params
    const result = await createCatalogItem(
      actor,
      id,
      await readJsonBody(request)
    )
    return jsonData(result, 201)
  } catch (error) {
    return jsonError(error)
  }
}
