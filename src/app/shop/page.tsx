import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { WaitingForData } from "@/components/dashboard/waiting-for-data"
import { canAccessShopSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Espace shop",
  robots: { index: false, follow: false },
}

export default async function ShopHomePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/shop")
  }
  if (!canAccessShopSpace(user.role, user.shopId)) {
    redirect("/interdit")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Tableau de bord
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Bonjour, {user.displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Vous êtes le responsable de {user.shopName ?? "ce shop"}
          {user.partnerName ? ` (${user.partnerName})` : ""}.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <WaitingForData title="Dépôts" />
        <WaitingForData title="Échanges" />
      </div>
    </div>
  )
}
