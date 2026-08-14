import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Créez votre compte DEEE Kinshasa : identité, numéro de téléphone, code OTP, puis mot de passe.",
  robots: { index: false, follow: false },
}

export default function InscriptionPage() {
  return (
    <AuthShell
      title="Créer un compte"
      description="Quelques étapes pour ouvrir votre compte et commencer à déposer vos appareils."
    >
      <SignupForm />
    </AuthShell>
  )
}
