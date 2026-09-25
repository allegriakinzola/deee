import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CitizenRedeemWorkspace } from "@/components/citizen/citizen-redeem-workspace"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import {
  getCitizenRedeemQuote,
  listCitizenRedeemHistory,
} from "@/modules/redeems"

export const metadata: Metadata = {
  title: "Échanger",
  robots: { index: false, follow: false },
}

export default async function CitizenRedeemPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/compte/echange")
  }
  if (!canAccessCitizenSpace(actor.role)) {
    redirect("/interdit")
  }

  const [quote, history] = await Promise.all([
    getCitizenRedeemQuote(actor),
    listCitizenRedeemHistory(actor),
  ])

  return <CitizenRedeemWorkspace quote={quote} history={history} />
}
