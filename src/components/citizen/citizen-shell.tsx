import Link from "next/link"
import type { ReactNode } from "react"

import { Logo } from "@/components/brand/logo"
import { CitizenStage } from "@/components/citizen/citizen-stage"
import { LogoutButton } from "@/components/gvb/logout-button"
import {
  CitizenSideNav,
  CitizenTabBar,
} from "@/components/citizen/citizen-tab-bar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/modules/auth"

export function CitizenShell({
  user,
  children,
}: {
  user: AuthUser
  children: ReactNode
}) {
  const firstName = user.displayName.trim().split(/\s+/)[0] || user.displayName

  return (
    <CitizenStage>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white lg:flex">
        <div className="shrink-0 border-b border-zinc-200/80 px-5 py-5">
          <Logo />
          <p className="mt-3 text-sm text-zinc-500">Mbote, {firstName}</p>
        </div>
        <CitizenSideNav />
        <div className="mt-auto shrink-0 space-y-3 border-t border-zinc-200/80 p-4">
          <Link href="/compte/profil" className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user.displayName.trim().charAt(0).toUpperCase() || "U"}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-zinc-900">
                {user.displayName}
              </span>
              <span className="block truncate text-xs text-zinc-500">
                {user.email}
              </span>
            </span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-zinc-200/70 bg-white/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <Link
              href="/compte/profil"
              className="flex min-w-0 items-center gap-2"
              aria-label="Mon compte"
            >
              <span className="truncate text-sm text-zinc-500">
                {firstName}
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {user.displayName.trim().charAt(0).toUpperCase() || "U"}
              </span>
            </Link>
          </div>
        </header>

        <header className="hidden shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-8 py-3.5 backdrop-blur-md lg:flex">
          <p className="text-sm text-zinc-500">
            Mon espace · déchets électriques et électroniques
          </p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Site public
          </Link>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full">{children}</div>
        </main>

        <CitizenTabBar />
      </div>
    </CitizenStage>
  )
}
