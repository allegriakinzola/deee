import {
  GiftIcon,
  LayoutDashboardIcon,
  RecycleIcon,
  SparklesIcon,
  StoreIcon,
  UserCogIcon,
} from "lucide-react"

import type { WorkspaceGroup } from "@/components/workspace/workspace-shell"
import type { SpaceNavItem } from "@/components/workspace/space-nav"

const dashboard: SpaceNavItem = {
  href: "/partenaire",
  label: "Tableau de bord",
  shortLabel: "Accueil",
  icon: LayoutDashboardIcon,
}
const users: SpaceNavItem = {
  href: "/partenaire/utilisateurs",
  label: "Utilisateurs",
  shortLabel: "Équipe",
  icon: UserCogIcon,
}
const shops: SpaceNavItem = {
  href: "/partenaire/shops",
  label: "Shops",
  icon: StoreIcon,
}
const offers: SpaceNavItem = {
  href: "/partenaire/offres",
  label: "Offres",
  icon: GiftIcon,
}
const deposits: SpaceNavItem = {
  href: "/partenaire/depots",
  label: "Dépôts",
  icon: RecycleIcon,
}
const redeems: SpaceNavItem = {
  href: "/partenaire/echanges",
  label: "Échanges",
  icon: SparklesIcon,
}

export const PARTNER_GROUPS: WorkspaceGroup[] = [
  { label: "Pilotage", items: [dashboard, users] },
  { label: "Réseau", items: [shops, offers] },
  { label: "Activité", items: [deposits, redeems] },
]

export const PARTNER_MOBILE: SpaceNavItem[] = [
  dashboard,
  shops,
  offers,
  deposits,
  redeems,
  users,
]
