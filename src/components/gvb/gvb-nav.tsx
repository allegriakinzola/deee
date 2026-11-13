"use client"

import {
  LayoutDashboardIcon,
  RecycleIcon,
  SettingsIcon,
  SparklesIcon,
  StoreIcon,
  TagsIcon,
  UserCogIcon,
  Building2Icon,
} from "lucide-react"

import { SpaceNav } from "@/components/workspace/space-nav"

const ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboardIcon },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCogIcon },
  { href: "/admin/partenaires", label: "Partenaires", icon: Building2Icon },
  { href: "/admin/shops", label: "Shops", icon: StoreIcon },
  { href: "/admin/materiels", label: "Matériels", icon: TagsIcon },
  { href: "/admin/depots", label: "Dépôts", icon: RecycleIcon },
  { href: "/admin/echanges", label: "Échanges", icon: SparklesIcon },
  { href: "/admin/parametres", label: "Paramètres", icon: SettingsIcon },
] as const

export function GvbNav({ variant }: { variant: "side" | "mobile" }) {
  return <SpaceNav items={ITEMS} variant={variant} homeHref="/admin" />
}
