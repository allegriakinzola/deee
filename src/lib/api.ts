type ApiSuccess<T> = { data: T }
type ApiFailure = { error: { code: string; message: string } }

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

async function readPayload<T>(
  response: Response
): Promise<ApiSuccess<T> | ApiFailure> {
  try {
    return (await response.json()) as ApiSuccess<T> | ApiFailure
  } catch {
    return {
      error: {
        code: "INTERNAL",
        message: "Réponse inattendue du serveur.",
      },
    }
  }
}

async function sendJson<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const payload = await readPayload<T>(response)

    if (!response.ok || !("data" in payload)) {
      return {
        ok: false,
        message:
          "error" in payload
            ? payload.error.message
            : "La requête a échoué.",
      }
    }

    return { ok: true, data: payload.data }
  } catch {
    return { ok: false, message: "Impossible de joindre le serveur." }
  }
}

export function postJson<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return sendJson<T>("POST", path, body)
}

export function patchJson<T>(
  path: string,
  body?: unknown
): Promise<ApiResult<T>> {
  return sendJson<T>("PATCH", path, body)
}

export function deleteJson<T>(path: string): Promise<ApiResult<T>> {
  return sendJson<T>("DELETE", path)
}

export async function postForm<T>(
  path: string,
  body: FormData
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, { method: "POST", body })
    const payload = await readPayload<T>(response)

    if (!response.ok || !("data" in payload)) {
      return {
        ok: false,
        message:
          "error" in payload ? payload.error.message : "La requête a échoué.",
      }
    }

    return { ok: true, data: payload.data }
  } catch {
    return { ok: false, message: "Impossible de joindre le serveur." }
  }
}
