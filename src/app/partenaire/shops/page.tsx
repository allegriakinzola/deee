import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { PartnerShopsWorkspace } from "@/components/partner/partner-shops-workspace"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listPartnerShops } from "@/modules/shops"

export const metadata: Metadata = {
  title: "Shops",
  robots: { index: false, follow: false },
}

export default async function PartnerShopsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/partenaire/shops")
  }
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId)) {
    redirect("/interdit")
  }

  const shops = await listPartnerShops(actor)
  return <PartnerShopsWorkspace shops={shops} />
}
