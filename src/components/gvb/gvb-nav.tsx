"use client"

import {
  Building2Icon,
  LayoutDashboardIcon,
  RecycleIcon,
  SparklesIcon,
  StoreIcon,
  TagsIcon,
  TruckIcon,
  UserCogIcon,
} from "lucide-react"

import { SpaceNav } from "@/components/workspace/space-nav"

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboardIcon },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCogIcon },
  { href: "/admin/partenaires", label: "Partenaires", icon: Building2Icon },
  { href: "/admin/shops", label: "Shops", icon: StoreIcon },
  { href: "/admin/catalogue", label: "Catalogue", icon: TagsIcon, soon: true },
  { href: "/admin/depots", label: "Dépôts", icon: RecycleIcon, soon: true },
  { href: "/admin/echanges", label: "Échanges", icon: SparklesIcon, soon: true },
  { href: "/admin/collectes", label: "Collectes", icon: TruckIcon, soon: true },
] as const

export function GvbNav({ variant }: { variant: "side" | "mobile" }) {
  return <SpaceNav items={ITEMS} variant={variant} homeHref="/admin" />
}
