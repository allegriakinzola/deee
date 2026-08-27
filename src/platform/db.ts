import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

import { getDatabaseUrl } from "@/platform/env"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() })
  return new PrismaClient({ adapter })
}

function isCurrentClient(client: PrismaClient): boolean {
  return "partner" in client && "shop" in client
}

const cached = globalForPrisma.prisma
export const prisma =
  cached && isCurrentClient(cached) ? cached : createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
