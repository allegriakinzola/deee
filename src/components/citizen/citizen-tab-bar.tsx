"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HouseIcon,
  MapPinIcon,
  RecycleIcon,
  SmartphoneIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const TABS = [
  { href: "/compte", label: "Accueil", icon: HouseIcon, exact: true },
  { href: "/compte/depot", label: "Dépôt", icon: RecycleIcon },
  { href: "/compte/echange", label: "Échanger", icon: SparklesIcon },
  { href: "/compte/catalogue", label: "Catalogue", icon: SmartphoneIcon },
  { href: "/compte/shops", label: "Shops", icon: MapPinIcon },
  { href: "/compte/profil", label: "Compte", icon: UserIcon },
] as const

const SIDE_GROUPS = [
  {
    label: "Aujourd’hui",
    items: [{ href: "/compte", label: "Accueil", icon: HouseIcon, exact: true }],
  },
  {
    label: "Agir",
    items: [
      { href: "/compte/depot", label: "Déposer", icon: RecycleIcon },
      { href: "/compte/echange", label: "Échanger", icon: SparklesIcon },
      { href: "/compte/catalogue", label: "Catalogue", icon: SmartphoneIcon },
      { href: "/compte/shops", label: "Shops", icon: MapPinIcon },
    ],
  },
  {
    label: "Moi",
    items: [{ href: "/compte/profil", label: "Compte", icon: UserIcon }],
  },
] as const

function isActive(
  pathname: string,
  item: { href: string; exact?: boolean }
) {
  if (item.exact) {
    return pathname === item.href
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function CitizenTabBar() {
  const pathname = usePathname()

  return (
    <nav className="shrink-0 border-t border-zinc-200/80 bg-white px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon
          if ("soon" in tab && tab.soon) {
            return (
              <span
                key={tab.label}
                className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-zinc-300"
              >
                <Icon className="size-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </span>
            )
          }

          const active = isActive(pathname, tab)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl",
                active ? "bg-emerald-50 text-emerald-800" : "text-zinc-400"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function CitizenSideNav() {
  const pathname = usePathname()

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {SIDE_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">
            {group.label}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item)
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
  )
}
