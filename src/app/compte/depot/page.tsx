import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CitizenDepositWorkspace } from "@/components/citizen/citizen-deposit-workspace"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import {
  getCitizenDraft,
  listCitizenDepositHistory,
} from "@/modules/deposits"
import { DEFAULT_USD_PER_POINT } from "@/modules/catalog"
import { listPickupMaterials } from "@/modules/materials"

export const metadata: Metadata = {
  title: "Dépôt",
  robots: { index: false, follow: false },
}

export default async function CitizenDepositPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/compte/depot")
  }
  if (!canAccessCitizenSpace(actor.role)) {
    redirect("/interdit")
  }

  const [materials, draft, history] = await Promise.all([
    listPickupMaterials(actor),
    getCitizenDraft(actor),
    listCitizenDepositHistory(actor),
  ])

  return (
    <CitizenDepositWorkspace
      materials={materials}
      draft={draft}
      history={history}
      usdPerPoint={DEFAULT_USD_PER_POINT}
    />
  )
}
