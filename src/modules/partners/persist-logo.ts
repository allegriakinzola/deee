import "server-only"

import { randomToken } from "@/platform/crypto"
import {
  inspectImage,
  removePublicUpload,
  writePublicUpload,
} from "@/platform/uploads"

export async function persistPartnerLogo(input: {
  partnerId: string
  bytes: Buffer
  previousLogo: string | null
}): Promise<string> {
  const { ext } = inspectImage(input.bytes)
  const filename = `${input.partnerId}-${randomToken().slice(0, 12)}.${ext}`
  const publicPath = await writePublicUpload({
    directory: "partners",
    filename,
    bytes: input.bytes,
  })
  await removePublicUpload(input.previousLogo)
  return publicPath
}
