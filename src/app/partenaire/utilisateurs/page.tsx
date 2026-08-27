import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PartnerUsersWorkspace } from "@/components/partner/partner-users-workspace"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listPartnerMembers } from "@/modules/partners"

export const metadata: Metadata = {
  title: "Utilisateurs",
  robots: { index: false, follow: false },
}

export default async function PartnerUsersPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/partenaire/utilisateurs")
  }
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId) || !actor.partnerId) {
    redirect("/interdit")
  }

  const users = await listPartnerMembers(actor, actor.partnerId)

  return (
    <PartnerUsersWorkspace
      actorId={actor.id}
      partnerId={actor.partnerId}
      users={users}
    />
  )
}
