import "server-only"

import type { AuthUser } from "@/modules/auth"
import { accessFromUser } from "@/modules/users"

import { assertCanManagePartners } from "./assert-manager"
import type { DirectoryPartner } from "./contract"
import { listPartnersWithAdmins } from "./repository"

export async function listDirectoryPartners(
  actor: AuthUser
): Promise<DirectoryPartner[]> {
  assertCanManagePartners(actor)

  const partners = await listPartnersWithAdmins()

  return partners.map((partner) => ({
    id: partner.id,
    name: partner.name,
    shortName: partner.shortName,
    slug: partner.slug,
    kind: partner.kind,
    logo: partner.logo,
    status: partner.status,
    createdAt: partner.createdAt.toISOString(),
    admins: partner.memberships.map((membership) => ({
      id: membership.user.id,
      displayName: membership.user.displayName,
      email:
        membership.user.identities.find((identity) => identity.type === "EMAIL")
          ?.value ?? null,
      access: accessFromUser(membership.user),
      status: membership.user.status,
    })),
  }))
}
