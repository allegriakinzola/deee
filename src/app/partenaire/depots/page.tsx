import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { DepositRegister } from "@/components/activity/deposit-register"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listPartnerDeposits, readDepositQuery } from "@/modules/deposits"

export const metadata: Metadata = {
  title: "Dépôts",
  robots: { index: false, follow: false },
}

export default async function PartnerDepositsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}) {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/partenaire/depots")
  }
  if (!canAccessPartnerAdmin(actor.role, actor.partnerId)) {
    redirect("/interdit")
  }

  const register = await listPartnerDeposits(
    actor,
    readDepositQuery(await searchParams, false)
  )

  return (
    <DepositRegister
      eyebrow={actor.partnerName ?? "Partenaire"}
      description="Dépôts envoyés dans vos shops, 20 par page. Le responsable confirme ou refuse au comptoir."
      register={register}
      showPartner={false}
      showDrafts={false}
    />
  )
}
