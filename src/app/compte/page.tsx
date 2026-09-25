import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CitizenHome } from "@/components/citizen/citizen-home"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { getCitizenDashboard } from "@/modules/deposits"

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

  const data = await getCitizenDashboard(user)

  return <CitizenHome displayName={user.displayName} data={data} />
}
