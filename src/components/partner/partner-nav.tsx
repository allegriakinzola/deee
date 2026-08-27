"use client"

import {
  LayoutDashboardIcon,
  RecycleIcon,
  SparklesIcon,
  StoreIcon,
  UserCogIcon,
} from "lucide-react"

import { SpaceNav } from "@/components/workspace/space-nav"

const ITEMS = [
  { href: "/partenaire", label: "Tableau de bord", icon: LayoutDashboardIcon },
  {
    href: "/partenaire/utilisateurs",
    label: "Utilisateurs",
    icon: UserCogIcon,
  },
  { href: "/partenaire/shops", label: "Shops", icon: StoreIcon },
  {
    href: "/partenaire/depots",
    label: "Dépôts",
    icon: RecycleIcon,
    soon: true,
  },
  {
    href: "/partenaire/echanges",
    label: "Échanges",
    icon: SparklesIcon,
    soon: true,
  },
] as const

export function PartnerNav({ variant }: { variant: "side" | "mobile" }) {
  return <SpaceNav items={ITEMS} variant={variant} homeHref="/partenaire" />
}
