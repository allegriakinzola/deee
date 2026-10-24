import { appErrorFromUnknown } from "@/platform/errors"

export type ApiSuccess<T> = { data: T }
export type ApiFailure = { error: { code: string; message: string } }

export function jsonData<T>(data: T, status = 200): Response {
  return Response.json({ data } satisfies ApiSuccess<T>, { status })
}

export function jsonError(error: unknown): Response {
  const known = appErrorFromUnknown(error)
  if (known) {
    return Response.json(
      {
        error: { code: known.code, message: known.message },
      } satisfies ApiFailure,
      { status: known.status }
    )
  }

  console.error(error)
  return Response.json(
    {
      error: {
        code: "INTERNAL",
        message: "Une erreur inattendue s’est produite.",
      },
    } satisfies ApiFailure,
    { status: 500 }
  )
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export function formString(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === "string" ? value : ""
}

export async function formFileBytes(
  form: FormData,
  key: string
): Promise<Buffer | null> {
  const value = form.get(key)
  if (!(value instanceof Blob) || value.size === 0) {
    return null
  }
  return Buffer.from(await value.arrayBuffer())
}

export function fileDownload(
  bytes: Uint8Array,
  filename: string,
  contentType: string
): Response {
  return new Response(new Blob([Buffer.from(bytes)], { type: contentType }), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
