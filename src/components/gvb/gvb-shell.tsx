import Link from "next/link"
import type { ReactNode } from "react"

import { Logo } from "@/components/brand/logo"
import { GvbNav } from "@/components/gvb/gvb-nav"
import { LogoutButton } from "@/components/gvb/logout-button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/modules/auth"

export function GvbShell({
  user,
  children,
}: {
  user: AuthUser
  children: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border/80 bg-card lg:flex">
        <div className="shrink-0 border-b border-border/80 px-5 py-5">
          <Logo />
          <p className="mt-3 text-[11px] font-semibold tracking-[0.18em] text-emerald-800/75 uppercase">
            Espace opérateur
          </p>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
          <GvbNav variant="side" />
        </nav>
        <div className="mt-auto shrink-0 border-t border-border/80 p-4">
          <p className="truncate text-sm font-medium">{user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden lg:pl-64">
        <header className="flex shrink-0 items-center justify-between border-b border-border/80 bg-card/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            DEEE Kinshasa — administration
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Site public
            </Link>
            <LogoutButton />
          </div>
        </header>
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border/80 px-4 py-2 lg:hidden">
          <GvbNav variant="mobile" />
        </nav>
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
