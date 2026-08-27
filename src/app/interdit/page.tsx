import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Accès refusé",
  robots: { index: false, follow: false },
}

export default function InterditPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-6 py-16 text-center">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
        Accès
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Cet espace n’est pas disponible
      </h1>
      <p className="mt-3 text-muted-foreground">
        Votre compte est reconnu, mais l’espace correspondant à votre rôle n’est
        pas encore ouvert, ou vous n’y avez pas accès.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Retour à l’accueil
        </Link>
        <Link
          href="/connexion"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Connexion
        </Link>
      </div>
    </main>
  )
}
