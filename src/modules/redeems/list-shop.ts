import "server-only"

import type { AuthUser } from "@/modules/auth"

import { assertShopStaff } from "./assert-shop"
import type { DirectoryRedeem } from "./contract"
import { toDirectoryRedeem } from "./present"
import { listShopRedeems } from "./repository"

export async function listShopRedeemInbox(
  actor: AuthUser
): Promise<{ pending: DirectoryRedeem[]; done: DirectoryRedeem[] }> {
  const shopId = assertShopStaff(actor)
  const [pending, done] = await Promise.all([
    listShopRedeems(shopId, ["SENT"]),
    listShopRedeems(shopId, ["CONFIRMED", "REJECTED"]),
  ])
  return {
    pending: pending.map(toDirectoryRedeem),
    done: done.map(toDirectoryRedeem),
  }
}
