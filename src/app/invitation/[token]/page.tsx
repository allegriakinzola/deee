import type { Metadata } from "next"
import Link from "next/link"

import { AcceptInvitationForm } from "@/components/auth/accept-invitation-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { CitizenAuthShell } from "@/components/citizen/citizen-auth-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { peekInvitation } from "@/modules/users"

export const metadata: Metadata = {
  title: "Invitation",
  robots: { index: false, follow: false },
}

export default async function InvitationPage({
  params,
}: PageProps<"/invitation/[token]">) {
  const { token } = await params
  const preview = await peekInvitation(token)

  if (!preview) {
    return (
      <AuthShell
        title="Invitation invalide"
        description="Ce lien a expiré, a déjà été utilisé, ou n’existe pas. Demandez un nouveau lien, ou créez un compte depuis la page d’inscription."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/connexion" className={cn(buttonVariants({ size: "lg" }))}>
            Aller à la connexion
          </Link>
          <Link
            href="/inscription"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Créer un compte
          </Link>
        </div>
      </AuthShell>
    )
  }

  const roleLabel =
    preview.role === "CITIZEN"
      ? "citoyen"
      : preview.role === "GVB_ADMIN"
        ? "administrateur GVB"
        : preview.role === "GVB_COLLECTOR"
          ? "collecteur GVB"
          : preview.role === "SHOP_STAFF"
            ? preview.shopName
              ? `responsable ${preview.shopName}`
              : "responsable de shop"
            : preview.partnerName
              ? `administrateur ${preview.partnerName}`
              : "administrateur partenaire"

  const description =
    preview.role === "CITIZEN"
      ? `Vous ouvrez votre compte DEEE Kinshasa${preview.email ? ` (${preview.email})` : ""}. Choisissez un mot de passe, puis confirmez-le.`
      : `Vous rejoignez DEEE Kinshasa en tant que ${roleLabel}${preview.email ? ` (${preview.email})` : ""}. Choisissez un mot de passe, puis confirmez-le.`

  const Shell = preview.role === "CITIZEN" ? CitizenAuthShell : AuthShell

  return (
    <Shell title="Activer votre compte" description={description}>
      <AcceptInvitationForm token={token} defaultName={preview.displayName} />
    </Shell>
  )
}
