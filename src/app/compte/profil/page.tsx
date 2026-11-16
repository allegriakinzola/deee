import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  MapPinIcon,
  RecycleIcon,
  SmartphoneIcon,
  SparklesIcon,
} from "lucide-react"

import { CitizenLogoutButton } from "@/components/citizen/citizen-logout-button"
import { CitizenPageHeader, CitizenSection } from "@/components/citizen/citizen-page"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Compte",
  robots: { index: false, follow: false },
}

const LINKS = [
  { href: "/compte/depot", label: "Préparer un dépôt", icon: RecycleIcon },
  { href: "/compte/echange", label: "Échanger des bons", icon: SparklesIcon },
  { href: "/compte/catalogue", label: "Voir le catalogue", icon: SmartphoneIcon },
  { href: "/compte/shops", label: "Trouver un shop", icon: MapPinIcon },
] as const

export default async function CitizenProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/compte/profil")
  }
  if (!canAccessCitizenSpace(user.role)) {
    redirect("/interdit")
  }

  const initial = user.displayName.trim().charAt(0).toUpperCase() || "U"

  return (
    <div className="flex flex-col gap-8 pb-2 lg:gap-10">
      <CitizenPageHeader
        title="Compte"
        description="Vos informations et les actions de votre espace."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <CitizenSection eyebrow="Profil" title="Identité">
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {initial}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-tight text-zinc-950">
                {user.displayName}
              </h2>
              <p className="mt-1 truncate text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>
          <ul className="mt-6 divide-y divide-zinc-100">
            {LINKS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-12 items-center gap-3 py-3 text-sm font-medium text-zinc-900"
                  >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                      <Icon className="size-4" />
                    </span>
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <Link
                href="/"
                className="flex min-h-12 items-center py-3 text-sm font-medium text-zinc-900"
              >
                Site public
              </Link>
            </li>
          </ul>
        </CitizenSection>

        <CitizenSection
          eyebrow="Session"
          title="Cet appareil"
          description="La déconnexion ferme cet espace sur cet appareil. Vous pourrez vous reconnecter avec le même e-mail."
        >
          <CitizenLogoutButton />
        </CitizenSection>
      </div>
    </div>
  )
}
