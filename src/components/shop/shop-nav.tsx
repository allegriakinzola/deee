"use client"

import {
  LayoutDashboardIcon,
  RecycleIcon,
  SparklesIcon,
} from "lucide-react"

import { SpaceNav } from "@/components/workspace/space-nav"

const ITEMS = [
  { href: "/shop", label: "Tableau de bord", icon: LayoutDashboardIcon },
  { href: "/shop/depots", label: "Dépôts", icon: RecycleIcon, soon: true },
  { href: "/shop/echanges", label: "Échanges", icon: SparklesIcon, soon: true },
] as const

export function ShopNav({ variant }: { variant: "side" | "mobile" }) {
  return <SpaceNav items={ITEMS} variant={variant} homeHref="/shop" />
}
