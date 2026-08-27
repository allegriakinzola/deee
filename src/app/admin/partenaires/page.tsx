import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PartnersWorkspace } from "@/components/gvb/partners-workspace"
import { canManagePartners } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listDirectoryPartners } from "@/modules/partners"

export const metadata: Metadata = {
  title: "Partenaires",
  robots: { index: false, follow: false },
}

export default async function AdminPartnersPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/admin/partenaires")
  }
  if (!canManagePartners(actor.role)) {
    redirect("/interdit")
  }

  const partners = await listDirectoryPartners(actor)

  return <PartnersWorkspace partners={partners} />
}
