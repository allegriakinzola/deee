export type LiveEvent = {
  type:
    | "deposit.sent"
    | "deposit.confirmed"
    | "deposit.rejected"
    | "redeem.sent"
    | "redeem.confirmed"
    | "redeem.rejected"
  at: string
}

type LiveClient = {
  channels: Set<string>
  send: (payload: string) => void
}

function clients(): Set<LiveClient> {
  const scope = globalThis as typeof globalThis & {
    __deeeLiveClients?: Set<LiveClient>
  }
  if (!scope.__deeeLiveClients) {
    scope.__deeeLiveClients = new Set()
  }
  return scope.__deeeLiveClients
}

export function registerLiveClient(client: LiveClient) {
  clients().add(client)
  return () => {
    clients().delete(client)
  }
}

export function publishLive(channels: string[], event: LiveEvent) {
  const payload = JSON.stringify(event)
  for (const client of clients()) {
    for (const channel of channels) {
      if (client.channels.has(channel)) {
        client.send(payload)
        break
      }
    }
  }
}

export function userChannel(userId: string) {
  return `user:${userId}`
}

export function shopChannel(shopId: string) {
  return `shop:${shopId}`
}
