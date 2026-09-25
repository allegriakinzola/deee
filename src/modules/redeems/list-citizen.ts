import "server-only"

import type { AuthUser } from "@/modules/auth"

import { assertCitizen } from "./assert-citizen"
import type { DirectoryRedeem } from "./contract"
import { toDirectoryRedeem } from "./present"
import { listCitizenRedeems } from "./repository"

export async function listCitizenRedeemHistory(
  actor: AuthUser
): Promise<DirectoryRedeem[]> {
  assertCitizen(actor)
  const rows = await listCitizenRedeems(actor.id)
  return rows.map(toDirectoryRedeem)
}
