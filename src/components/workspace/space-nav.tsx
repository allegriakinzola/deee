"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

export type SpaceNavItem = {
  href: string
  label: string
  icon: LucideIcon
  soon?: boolean
}

function isActive(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) {
    return pathname === homeHref
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SpaceNav({
  items,
  variant,
  homeHref,
}: {
  items: readonly SpaceNavItem[]
  variant: "side" | "mobile"
  homeHref: string
}) {
  const pathname = usePathname()

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon

        if (item.soon) {
          if (variant === "mobile") {
            return (
              <span
                key={item.label}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground/70"
              >
                <Icon className="size-3.5" />
                {item.label}
                <span className="text-[9px] font-medium tracking-wide uppercase">
                  Bientôt
                </span>
              </span>
            )
          }

          return (
            <span
              key={item.label}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted-foreground/70"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4" />
                {item.label}
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase">
                Bientôt
              </span>
            </span>
          )
        }

        const active = isActive(pathname, item.href, homeHref)
        if (variant === "mobile") {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/35 px-3 py-1.5 text-xs font-medium"
                  : "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
              }
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "flex items-center gap-2.5 rounded-xl bg-primary/35 px-3 py-2.5 text-sm font-medium text-foreground"
                : "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  )
}
