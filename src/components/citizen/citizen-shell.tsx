import Link from "next/link"
import { BellIcon, UserIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Logo } from "@/components/brand/logo"
import { CitizenStage } from "@/components/citizen/citizen-stage"
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
        <div className="mt-auto shrink-0 border-t border-zinc-200/80 p-4">
          <p className="truncate text-sm font-medium text-zinc-900">
            {user.displayName}
          </p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 px-4 pt-[max(0.7rem,env(safe-area-inset-top))] lg:hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[13px] text-zinc-500">Mbote, {firstName}</p>
              <p className="truncate text-[17px] font-semibold tracking-tight text-zinc-900">
                DEEE Kinshasa
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="relative flex size-11 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200"
                aria-label="Notifications"
              >
                <BellIcon className="size-5" />
              </span>
              <Link
                href="/compte/profil"
                className="flex size-11 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200"
                aria-label="Mon compte"
              >
                <UserIcon className="size-5" />
              </Link>
            </div>
          </div>
        </header>

        <header className="hidden shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-8 py-3.5 backdrop-blur-md lg:flex">
          <p className="text-sm text-zinc-500">DEEE Kinshasa — mon compte</p>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Site public
            </Link>
            <Link
              href="/compte/profil"
              className="flex size-9 items-center justify-center rounded-full bg-[#f3f5f7] text-zinc-500 ring-1 ring-zinc-200"
              aria-label="Mon compte"
            >
              <UserIcon className="size-4" />
            </Link>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pt-3 pb-3 lg:px-10 lg:py-8">
          <div className="lg:mx-auto lg:max-w-5xl">{children}</div>
        </main>

        <CitizenTabBar />
      </div>
    </CitizenStage>
  )
}
