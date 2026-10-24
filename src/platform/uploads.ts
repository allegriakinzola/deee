import "server-only"

import { mkdir, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

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

export async function writePublicUpload(input: {
  directory: string
  filename: string
  bytes: Buffer
}): Promise<string> {
  if (isServerlessFilesystem()) {
    return imageDataUrl(input.bytes)
  }

  const relativeDir = path.posix.join("uploads", input.directory)
  const absDir = path.join(process.cwd(), "public", ...relativeDir.split("/"))
  try {
    await mkdir(absDir, { recursive: true })
    await writeFile(path.join(absDir, input.filename), input.bytes)
    return `/${relativeDir}/${input.filename}`
  } catch (error) {
    console.error("Écriture fichier impossible, logo conservé en base.", error)
    return imageDataUrl(input.bytes)
  }
}

export async function removePublicUpload(
  publicPath: string | null
): Promise<void> {
  const abs = resolveUploadPath(publicPath)
  if (!abs) {
    return
  }
  await unlink(abs).catch(() => undefined)
}

function imageDataUrl(bytes: Buffer): string {
  const { ext } = inspectImage(bytes)
  const mime =
    ext === "jpg" ? "image/jpeg" : ext === "png" ? "image/png" : "image/webp"
  return `data:${mime};base64,${bytes.toString("base64")}`
}

function isServerlessFilesystem(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT
  )
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
