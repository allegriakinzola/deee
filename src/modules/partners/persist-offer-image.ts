import "server-only"

import { randomToken } from "@/platform/crypto"
import {
  inspectImage,
  removePublicUpload,
  writePublicUpload,
} from "@/platform/uploads"

export async function persistOfferImage(input: {
  offerId: string
  bytes: Buffer
  previousImage: string | null
}): Promise<string> {
  const { ext } = inspectImage(input.bytes)
  const filename = `${input.offerId}-${randomToken().slice(0, 12)}.${ext}`
  const publicPath = await writePublicUpload({
    directory: "offers",
    filename,
    bytes: input.bytes,
  })
  await removePublicUpload(input.previousImage)
  return publicPath
}
