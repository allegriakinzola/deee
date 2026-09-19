import "server-only"

import type { AuthUser } from "@/modules/auth"

import { assertShopStaff } from "./assert-shop"
import type { DirectoryDeposit } from "./contract"
import { toDirectoryDeposit } from "./present"
import { listShopDeposits } from "./repository"

export async function listShopInbox(
  actor: AuthUser
): Promise<{ pending: DirectoryDeposit[]; done: DirectoryDeposit[] }> {
  const shopId = assertShopStaff(actor)
  const [pending, done] = await Promise.all([
    listShopDeposits(shopId, ["SENT"]),
    listShopDeposits(shopId, ["CONFIRMED", "REJECTED"]),
  ])
  return {
    pending: pending.map(toDirectoryDeposit),
    done: done.map(toDirectoryDeposit),
  }
}
