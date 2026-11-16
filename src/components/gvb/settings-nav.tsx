"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TicketPercentIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const ITEMS = [
  {
    href: "/admin/parametres",
    label: "Échanges",
    detail: "Valeur d’un bon",
    icon: TicketPercentIcon,
  },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ITEMS.map((item) => {
        const Icon = item.icon
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-52 shrink-0 items-center gap-3 rounded-2xl px-3 py-3 lg:min-w-0",
              active
                ? "bg-card ring-1 ring-foreground/10"
                : "hover:bg-muted/70"
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs text-muted-foreground">
                {item.detail}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
