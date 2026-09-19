import "server-only"

import type { AuthUser } from "@/modules/auth"

import { assertCitizen } from "./assert-citizen"
import type { DirectoryDeposit } from "./contract"
import { toDirectoryDeposit } from "./present"
import { listCitizenDeposits as listRows } from "./repository"

export async function listCitizenDepositHistory(
  actor: AuthUser
): Promise<DirectoryDeposit[]> {
  assertCitizen(actor)
  const rows = await listRows(actor.id)
  return rows.map(toDirectoryDeposit)
}
