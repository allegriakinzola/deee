import "server-only"

import type { AuthUser } from "@/modules/auth"
import { accessFromUser } from "@/modules/users"

import { assertCanManagePartnerMembers } from "./assert-member-manager"
import type { DirectoryPartnerAdmin } from "./contract"
import { listMembersForPartner } from "./repository"

export async function listPartnerMembers(
  actor: AuthUser,
  partnerId: string
): Promise<DirectoryPartnerAdmin[]> {
  assertCanManagePartnerMembers(actor, partnerId)

  const memberships = await listMembersForPartner(partnerId)

  return memberships.map((membership) => ({
    id: membership.user.id,
    displayName: membership.user.displayName,
    email:
      membership.user.identities.find((identity) => identity.type === "EMAIL")
        ?.value ?? null,
    access: accessFromUser(membership.user),
    status: membership.user.status,
  }))
}
