import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { RedeemRegister } from "@/components/activity/redeem-register"
import { canAccessGvbAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listAdminRedeems } from "@/modules/redeems"

export const metadata: Metadata = {
  title: "Échanges",
  robots: { index: false, follow: false },
}

export default async function AdminRedeemsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/admin/echanges")
  }
  if (!canAccessGvbAdmin(actor.role)) {
    redirect("/interdit")
  }

  const register = await listAdminRedeems(actor)

  return (
    <RedeemRegister
      eyebrow="Réseau"
      description="Toutes les demandes de récompense. Le libellé est celui figé à l’envoi. Le shop remet l’offre et confirme."
      redeems={register.redeems}
      truncated={register.truncated}
      showPartner
    />
  )
}
