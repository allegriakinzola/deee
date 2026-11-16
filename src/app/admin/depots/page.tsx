import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { DepositRegister } from "@/components/activity/deposit-register"
import { canAccessGvbAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listAdminDeposits, readDepositQuery } from "@/modules/deposits"

export const metadata: Metadata = {
  title: "Dépôts",
  robots: { index: false, follow: false },
}

export default async function AdminDepositsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>
}) {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/admin/depots")
  }
  if (!canAccessGvbAdmin(actor.role)) {
    redirect("/interdit")
  }

  const register = await listAdminDeposits(
    actor,
    readDepositQuery(await searchParams, true)
  )

  return (
    <DepositRegister
      eyebrow="Réseau"
      description="Tous les dépôts de Kinshasa, 20 par page. La confirmation se fait au shop : cette page sert à suivre, pas à valider."
      register={register}
      showPartner
      showDrafts
    />
  )
}
