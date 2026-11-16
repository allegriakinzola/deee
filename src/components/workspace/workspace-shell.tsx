"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { EllipsisIcon } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { LogoutButton } from "@/components/gvb/logout-button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SpaceNavItem } from "@/components/workspace/space-nav"
import type { AuthUser } from "@/modules/auth"

export type WorkspaceGroup = {
  label: string
  items: readonly SpaceNavItem[]
}

function isActive(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) {
    return pathname === homeHref
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function WorkspaceShell({
  user,
  homeHref,
  spaceLabel,
  desktopTitle,
  groups,
  mobile,
  more = [],
  identity,
  children,
}: {
  user: AuthUser
  homeHref: string
  spaceLabel: string
  desktopTitle: string
  groups: readonly WorkspaceGroup[]
  mobile: readonly SpaceNavItem[]
  more?: readonly SpaceNavItem[]
  identity?: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const firstName = user.displayName.trim().split(/\s+/)[0] || user.displayName
  const initial = user.displayName.trim().charAt(0).toUpperCase() || "U"
  const columns = mobile.length + (more.length > 0 ? 1 : 0)
  const current = [...mobile, ...more].find((item) =>
    isActive(pathname, item.href, homeHref)
  )
  const moreActive = more.some((item) => isActive(pathname, item.href, homeHref))

  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-[#f3f5f7]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white lg:flex">
        <div className="shrink-0 border-b border-zinc-200/80 px-5 py-5">
          <Logo />
          <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-emerald-800/80 uppercase">
            {spaceLabel}
          </p>
          {identity ? <div className="mt-3">{identity}</div> : null}
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(pathname, item.href, homeHref)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                        active
                          ? "bg-emerald-50 text-emerald-900"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      )}
                    >
                      <Icon className="size-4" strokeWidth={active ? 2.4 : 2} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto shrink-0 space-y-3 border-t border-zinc-200/80 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-zinc-900">
                {user.displayName}
              </span>
              <span className="block truncate text-xs text-zinc-500">
                {user.email}
              </span>
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-zinc-200/70 bg-white/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Logo />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold tracking-[0.14em] text-emerald-800/80 uppercase">
                  {spaceLabel}
                </p>
                <p className="truncate text-base font-semibold tracking-tight text-zinc-950">
                  {current?.label ?? firstName}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </header>

        <header className="hidden shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-8 py-3.5 backdrop-blur-md lg:flex">
          <p className="text-sm text-zinc-500">{desktopTitle}</p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Site public
          </Link>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="w-full">{children}</div>
        </main>

        <nav className="shrink-0 border-t border-zinc-200/80 bg-white px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] lg:hidden">
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {mobile.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href, homeHref)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl",
                    active ? "bg-emerald-50 text-emerald-800" : "text-zinc-400"
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                  <span className="max-w-full truncate px-0.5 text-center text-[10px] font-medium leading-tight">
                    {item.shortLabel ?? item.label}
                  </span>
                </Link>
              )
            })}
            {more.length > 0 ? (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className={cn(
                  "flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl",
                  moreActive ? "bg-emerald-50 text-emerald-800" : "text-zinc-400"
                )}
              >
                <EllipsisIcon className="size-5" strokeWidth={moreActive ? 2.4 : 2} />
                <span className="text-[10px] font-medium leading-tight">Plus</span>
              </button>
            ) : null}
          </div>
        </nav>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[80dvh] rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>Tout l’espace</SheetTitle>
            <SheetDescription>
              Les pages qui ne tiennent pas dans la barre du bas.
            </SheetDescription>
          </SheetHeader>
          <ul className="space-y-1 overflow-y-auto px-4 pb-4">
            {more.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href, homeHref)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl px-3",
                      active ? "bg-emerald-50 text-emerald-900" : "text-zinc-800"
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
            <li>
              <Link
                href="/"
                className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-zinc-800"
              >
                Site public
              </Link>
            </li>
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  )
}
