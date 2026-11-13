import { getCurrentUser } from "@/modules/auth"
import {
  registerLiveClient,
  shopChannel,
  userChannel,
} from "@/platform/live"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.status !== "ACTIVE") {
    return new Response("Connexion requise", { status: 401 })
  }

  const channels = new Set([userChannel(user.id)])
  if (user.shopId) channels.add(shopChannel(user.shopId))

  let close: (() => void) | undefined
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      let open = true
      const write = (chunk: string) => {
        if (!open) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          open = false
        }
      }
      const unregister = registerLiveClient({
        channels,
        send(payload) {
          write(`data: ${payload}\n\n`)
        },
      })
      const heartbeat = setInterval(() => {
        write(`: ping\n\n`)
      }, 25000)
      close = () => {
        if (!open) return
        open = false
        clearInterval(heartbeat)
        unregister()
        try {
          controller.close()
        } catch {
          /* déjà fermé */
        }
      }
      write(
        `data: ${JSON.stringify({ type: "live.ready", at: new Date().toISOString() })}\n\n`
      )
    },
    cancel() {
      close?.()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
