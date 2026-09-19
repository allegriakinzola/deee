import "server-only"

import { randomToken } from "@/platform/crypto"
import {
  inspectImage,
  removePublicUpload,
  writePublicUpload,
} from "@/platform/uploads"

export async function persistMaterialImage(input: {
  materialId: string
  bytes: Buffer
  previousImage: string | null
}): Promise<string> {
  const { ext } = inspectImage(input.bytes)
  const filename = `${input.materialId}-${randomToken().slice(0, 12)}.${ext}`
  const publicPath = await writePublicUpload({
    directory: "materials",
    filename,
    bytes: input.bytes,
  })
  await removePublicUpload(input.previousImage)
  return publicPath
}
