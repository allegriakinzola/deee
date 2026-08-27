import type { Metadata } from "next"
import Link from "next/link"

import { WaitingForData } from "@/components/dashboard/waiting-for-data"
import { getCurrentUser } from "@/modules/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Espace partenaire",
  robots: { index: false, follow: false },
}

export default async function PartnerHomePage() {
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
          Vous administrez {user?.partnerName ?? "votre entreprise"} sur DEEE
          Kinshasa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Administrateurs de l’entreprise</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link
              href="/partenaire/utilisateurs"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Inviter et gérer l’équipe
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shops</CardTitle>
            <CardDescription>Points de dépôt</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link
              href="/partenaire/shops"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Créer et gérer les shops
            </Link>
          </CardContent>
        </Card>
        <WaitingForData title="Dépôts" />
        <WaitingForData title="Échanges" />
      </div>
    </div>
  )
}
