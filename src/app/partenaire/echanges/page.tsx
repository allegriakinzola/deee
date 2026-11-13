import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { RedeemRegister } from "@/components/activity/redeem-register"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listPartnerRedeems } from "@/modules/redeems"

export const metadata: Metadata = {
  title: "Échanges",
  robots: { index: false, follow: false },
}

export default async function PartnerRedeemsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/partenaire/echanges")
  }
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId)) {
    redirect("/interdit")
  }

  const register = await listPartnerRedeems(actor)

  return (
    <RedeemRegister
      eyebrow={actor.partnerName ?? "Partenaire"}
      description="Échanges envoyés dans vos shops. L’offre remise est celle de votre entreprise, figée au moment de l’envoi."
      redeems={register.redeems}
      truncated={register.truncated}
      showPartner={false}
    />
  )
}
