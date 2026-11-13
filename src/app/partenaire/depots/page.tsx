import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { DepositRegister } from "@/components/activity/deposit-register"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listPartnerDeposits } from "@/modules/deposits"

export const metadata: Metadata = {
  title: "Dépôts",
  robots: { index: false, follow: false },
}

export default async function PartnerDepositsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/partenaire/depots")
  }
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId)) {
    redirect("/interdit")
  }

  const register = await listPartnerDeposits(actor)

  return (
    <DepositRegister
      eyebrow={actor.partnerName ?? "Partenaire"}
      description="Dépôts envoyés dans vos shops. Le responsable de chaque shop confirme ou refuse au comptoir."
      deposits={register.deposits}
      truncated={register.truncated}
      showPartner={false}
      showDrafts={false}
    />
  )
}
