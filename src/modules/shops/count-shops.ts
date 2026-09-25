import "server-only"

import type { ShopStatus } from "@/generated/prisma/client"

import { countShops } from "./repository"

export async function countDirectoryShops(input?: {
  partnerId?: string
  status?: ShopStatus
}) {
  return countShops(input)
}
