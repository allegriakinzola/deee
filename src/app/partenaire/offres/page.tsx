import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PartnerOffersWorkspace } from "@/components/partner/partner-offers-workspace"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listOwnPartnerOffers } from "@/modules/partners"

export const metadata: Metadata = {
  title: "Offres",
  robots: { index: false, follow: false },
}

export default async function PartnerOffersPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/partenaire/offres")
  }
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId)) {
    redirect("/interdit")
  }

  const board = await listOwnPartnerOffers(actor)
  return <PartnerOffersWorkspace board={board} />
}
