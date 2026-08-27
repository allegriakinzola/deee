import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { homePathFor } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à DEEE Kinshasa avec votre e-mail et votre mot de passe.",
  robots: { index: false, follow: false },
}

export default async function ConnexionPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect(homePathFor(user.role))
  }

  return (
    <AuthShell
      title="Connexion"
      description="Entrez votre e-mail et votre mot de passe pour accéder à votre espace."
    >
      <LoginForm />
    </AuthShell>
  )
}
