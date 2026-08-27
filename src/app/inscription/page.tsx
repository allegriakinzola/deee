import type { Metadata, Viewport } from "next"

import { CitizenAuthShell } from "@/components/citizen/citizen-auth-shell"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Créez votre compte DEEE Kinshasa : indiquez votre nom et votre e-mail, puis activez-le depuis le lien reçu.",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#f3f5f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function InscriptionPage() {
  return (
    <CitizenAuthShell
      title="Créer un compte"
      description="Indiquez votre nom et votre e-mail. Vous recevrez un lien pour choisir votre mot de passe et activer le compte."
    >
      <SignupForm />
    </CitizenAuthShell>
  )
}
