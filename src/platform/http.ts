import { isAppError } from "@/platform/errors"

export type ApiSuccess<T> = { data: T }
export type ApiFailure = { error: { code: string; message: string } }

export function jsonData<T>(data: T, status = 200): Response {
  return Response.json({ data } satisfies ApiSuccess<T>, { status })
}

export function jsonError(error: unknown): Response {
  if (isAppError(error)) {
    return Response.json(
      {
        error: { code: error.code, message: error.message },
      } satisfies ApiFailure,
      { status: error.status }
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
  if (!(value instanceof File) || value.size === 0) {
    return null
  }
  return Buffer.from(await value.arrayBuffer())
}
