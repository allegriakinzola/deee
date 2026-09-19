import "server-only"

import type { AuthUser } from "@/modules/auth"

import { assertCitizen } from "./assert-citizen"
import type { DirectoryDeposit } from "./contract"
import { toDirectoryDeposit } from "./present"
import { createDraftRecord, findDraftByCitizen } from "./repository"

export async function getCitizenDraft(
  actor: AuthUser
): Promise<DirectoryDeposit> {
  assertCitizen(actor)
  const existing = await findDraftByCitizen(actor.id)
  if (existing) {
    return toDirectoryDeposit(existing)
  }
  const created = await createDraftRecord(actor.id)
  return toDirectoryDeposit(created)
}
