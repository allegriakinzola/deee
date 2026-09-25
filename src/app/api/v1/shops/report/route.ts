import { requireActor } from "@/modules/auth"
import { buildShopActivityReport } from "@/modules/shops"
import { fileDownload, jsonError } from "@/platform/http"

export async function GET() {
  try {
    const actor = await requireActor()
    const report = await buildShopActivityReport(actor)
    return fileDownload(report.bytes, report.filename, "application/pdf")
  } catch (error) {
    return jsonError(error)
  }
}
