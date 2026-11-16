import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

import { getDatabaseUrl } from "@/platform/env"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const revisions = new WeakMap<PrismaClient, string>()
const CLIENT_REVISION = "partner-offer-image"

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() })
  return new PrismaClient({ adapter })
}

function isCurrentClient(client: PrismaClient): boolean {
  return (
    "partner" in client &&
    "shop" in client &&
    "catalog" in client &&
    "material" in client &&
    "operatorSettings" in client &&
    "deposit" in client &&
    "redeem" in client &&
    "ledgerEntry" in client &&
    "partnerOffer" in client &&
    "storedFile" in client
  )
}

function client(): PrismaClient {
  const cached = globalForPrisma.prisma
  if (cached && isCurrentClient(cached)) {
    return cached
  }
  const created = createPrismaClient()
  globalForPrisma.prisma = created
  return created
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const current = client()
    const value = Reflect.get(current, prop, receiver)
    return typeof value === "function" ? value.bind(current) : value
  },
})
