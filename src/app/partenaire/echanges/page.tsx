import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { RedeemRegister } from "@/components/activity/redeem-register"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listPartnerRedeems, readRedeemQuery } from "@/modules/redeems"

export const metadata: Metadata = {
  title: "Échanges",
  robots: { index: false, follow: false },
}

export default async function PartnerRedeemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}) {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/partenaire/echanges")
  }
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId)) {
    redirect("/interdit")
  }

  const register = await listPartnerRedeems(
    actor,
    readRedeemQuery(await searchParams)
  )

  return (
    <RedeemRegister
      eyebrow={actor.partnerName ?? "Partenaire"}
      description="Échanges envoyés dans vos shops, 20 par page. L’offre remise est celle de votre entreprise, figée au moment de l’envoi."
      register={register}
      showPartner={false}
    />
  )
}
