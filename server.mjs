import { config } from "dotenv"
import { createServer } from "node:http"
import { parse } from "node:url"
import { WebSocketServer } from "ws"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

if (process.argv.includes("--prod")) {
  process.env.NODE_ENV = "production"
} else if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development"
}

const { default: next } = await import("next")
const { PrismaPg } = await import("@prisma/adapter-pg")
const { PrismaClient } = await import("./src/generated/prisma/client.ts")
const { sha256 } = await import("./src/platform/crypto.ts")
const { SESSION_COOKIE_NAME } = await import("./src/platform/session.ts")
const { registerLiveClient, shopChannel, userChannel } = await import(
  "./src/platform/live.ts"
)

const dev = process.env.NODE_ENV !== "production"
const port = Number(process.env.PORT || 3000)
const app = next({ dev })
const handle = app.getRequestHandler()

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

function readCookie(header, name) {
  if (!header) return null
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

await app.prepare()

const server = createServer((request, response) => {
  handle(request, response, parse(request.url ?? "", true))
})

const sockets = new WebSocketServer({ noServer: true })

server.on("upgrade", (request, socket, head) => {
  const pathname = parse(request.url ?? "").pathname
  if (pathname !== "/live") {
    socket.destroy()
    return
  }
  sockets.handleUpgrade(request, socket, head, (ws) => {
    sockets.emit("connection", ws, request)
  })
})

sockets.on("connection", async (ws, request) => {
  const token = readCookie(request.headers.cookie, SESSION_COOKIE_NAME)
  if (!token) {
    ws.close(4401, "Connexion requise")
    return
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    select: {
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          status: true,
          shopMembership: { select: { shopId: true } },
        },
      },
    },
  })

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt.getTime() <= Date.now() ||
    session.user.status !== "ACTIVE"
  ) {
    ws.close(4401, "Session invalide")
    return
  }

  const channels = new Set([userChannel(session.user.id)])
  if (session.user.shopMembership) {
    channels.add(shopChannel(session.user.shopMembership.shopId))
  }

  const unregister = registerLiveClient({
    channels,
    send(payload) {
      if (ws.readyState === ws.OPEN) ws.send(payload)
    },
  })

  ws.on("close", unregister)
  ws.send(JSON.stringify({ type: "live.ready", at: new Date().toISOString() }))
})

server.listen(port, () => {
  console.log(
    `DEEE Kinshasa ${dev ? "dev" : "production"} sur http://localhost:${port} (socket /live)`
  )
})
