import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PartnerDashboardView } from "@/components/partner/partner-dashboard"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { getPartnerDashboard } from "@/modules/partners"

export const metadata: Metadata = {
  title: "Espace partenaire",
  robots: { index: false, follow: false },
}

export default async function PartnerHomePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/partenaire")
  }
  if (!canAccessPartnerAdmin(user.role, user.partnerId)) {
    redirect("/interdit")
  }

  const data = await getPartnerDashboard(user)

  return (
    <PartnerDashboardView
      displayName={user.displayName}
      partnerName={user.partnerName ?? "votre entreprise"}
      data={data}
    />
  )
}
