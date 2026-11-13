import "server-only"

import { unlink } from "node:fs/promises"
import path from "node:path"

import { prisma } from "@/platform/db"
import { AppError, ErrorCode } from "@/platform/errors"

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024

export type ImageExtension = "jpg" | "png" | "webp"

export function inspectImage(
  bytes: Buffer,
  noun: "image" | "logo" = "image"
): { ext: ImageExtension } {
  const empty =
    noun === "logo" ? "Le fichier logo est vide." : "Le fichier image est vide."
  const tooBig =
    noun === "logo"
      ? "Le logo doit faire 2 Mo maximum."
      : "L’image doit faire 2 Mo maximum."
  const badType =
    noun === "logo"
      ? "Envoyez un logo JPEG, PNG ou WebP."
      : "Envoyez une image JPEG, PNG ou WebP."

  if (bytes.length === 0) {
    throw new AppError(ErrorCode.VALIDATION, 400, empty)
  }

  if (bytes.length > MAX_UPLOAD_BYTES) {
    throw new AppError(ErrorCode.VALIDATION, 400, tooBig)
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg" }
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { ext: "png" }
  }

  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { ext: "webp" }
  }

  throw new AppError(ErrorCode.VALIDATION, 400, badType)
}

const MEDIA_PREFIX = "/api/v1/media/"

export async function writePublicUpload(input: {
  bytes: Buffer
  directory?: string
  filename?: string
}): Promise<string> {
  const { ext } = inspectImage(input.bytes)
  const mime =
    ext === "jpg" ? "image/jpeg" : ext === "png" ? "image/png" : "image/webp"
  const stored = await prisma.storedFile.create({
    data: { mime, bytes: Uint8Array.from(input.bytes) },
    select: { id: true },
  })
  return `${MEDIA_PREFIX}${stored.id}`
}

export async function removePublicUpload(
  publicPath: string | null
): Promise<void> {
  if (publicPath?.startsWith(MEDIA_PREFIX)) {
    const id = publicPath.slice(MEDIA_PREFIX.length)
    if (id) {
      await prisma.storedFile.delete({ where: { id } }).catch(() => undefined)
    }
    return
  }
  const abs = resolveUploadPath(publicPath)
  if (!abs) {
    return
  }
  await unlink(abs).catch(() => undefined)
}

function resolveUploadPath(publicPath: string | null): string | null {
  if (!publicPath || !publicPath.startsWith("/uploads/")) {
    return null
  }

  const relative = publicPath.replace(/^\/+/, "")
  const abs = path.resolve(process.cwd(), "public", relative)
  const root = path.resolve(process.cwd(), "public", "uploads")
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`
  if (abs !== root && !abs.startsWith(prefix)) {
    return null
  }
  return abs
}
