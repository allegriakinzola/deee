import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CitizenHome } from "@/components/citizen/citizen-home"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { getCitizenBalance } from "@/modules/ledger"

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

  const balance = await getCitizenBalance(user)

  return (
    <CitizenHome
      displayName={user.displayName}
      points={balance.points}
      lastDeposit={balance.lastDeposit}
    />
  )
}
