import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CitizenHome } from "@/components/citizen/citizen-home"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { getCitizenBalance } from "@/modules/ledger"
import { getCitizenRedeemQuote } from "@/modules/redeems"

export const metadata: Metadata = {
  title: "Accueil",
  robots: { index: false, follow: false },
}

export default async function CitizenHomePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/compte")
  }
  if (!canAccessCitizenSpace(user.role)) {
    redirect("/interdit")
  }

  const [balance, quote] = await Promise.all([
    getCitizenBalance(user),
    getCitizenRedeemQuote(user),
  ])

  return (
    <CitizenHome
      displayName={user.displayName}
      points={balance.points}
      availablePoints={quote.availablePoints}
      bonsAvailable={quote.bonsAvailable}
      pointsPerBon={quote.pointsPerBon}
      lastDeposit={balance.lastDeposit}
    />
  )
}
