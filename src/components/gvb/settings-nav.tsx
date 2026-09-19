"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TicketPercentIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/admin/parametres", label: "Bons", icon: TicketPercentIcon },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ITEMS.map((item) => {
        const Icon = item.icon
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm",
              active
                ? "bg-primary/35 font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
