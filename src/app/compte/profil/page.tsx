import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { CitizenLogoutButton } from "@/components/citizen/citizen-logout-button"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Compte",
  robots: { index: false, follow: false },
}

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
    <div className="mx-auto flex max-w-lg flex-col gap-4 pb-2 lg:max-w-xl">
      <section className="flex flex-col items-center rounded-2xl bg-white px-4 py-7">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {initial}
        </span>
        <h1 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900">
          {user.displayName}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">{user.email}</p>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white">
        <Link
          href="/"
          className="flex min-h-12 items-center px-4 text-sm font-medium text-zinc-900"
        >
          Site public
        </Link>
      </section>

      <CitizenLogoutButton />
    </div>
  )
}
