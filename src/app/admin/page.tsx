import type { Metadata } from "next"

import { getCurrentUser } from "@/modules/auth"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const user = await getCurrentUser()

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Tableau de bord
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Bonjour, {user?.displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Vous êtes connecté à l’espace opérateur.
        </p>
      </div>

      <Card className="flex min-h-[22rem] items-center justify-center px-8 py-16">
        <p className="text-center text-2xl font-semibold tracking-tight text-muted-foreground sm:text-3xl">
          En cours de développement…
        </p>
      </Card>
    </div>
  )
}
