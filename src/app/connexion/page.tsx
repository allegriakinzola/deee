import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à DEEE Kinshasa avec votre numéro de téléphone et votre mot de passe.",
  robots: { index: false, follow: false },
}

export default function ConnexionPage() {
  return (
    <AuthShell
      title="Connexion"
      description="Entrez votre numéro de téléphone et votre mot de passe pour accéder à votre compte."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
