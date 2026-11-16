import {
  Building2Icon,
  LayoutDashboardIcon,
  RecycleIcon,
  SettingsIcon,
  SparklesIcon,
  StoreIcon,
  TagsIcon,
  UserCogIcon,
} from "lucide-react"

import type { WorkspaceGroup } from "@/components/workspace/workspace-shell"
import type { SpaceNavItem } from "@/components/workspace/space-nav"

const dashboard: SpaceNavItem = {
  href: "/admin",
  label: "Tableau de bord",
  shortLabel: "Accueil",
  icon: LayoutDashboardIcon,
}
const users: SpaceNavItem = {
  href: "/admin/utilisateurs",
  label: "Utilisateurs",
  icon: UserCogIcon,
}
const partners: SpaceNavItem = {
  href: "/admin/partenaires",
  label: "Partenaires",
  icon: Building2Icon,
}
const shops: SpaceNavItem = {
  href: "/admin/shops",
  label: "Shops",
  icon: StoreIcon,
}
const materials: SpaceNavItem = {
  href: "/admin/materiels",
  label: "Matériels",
  icon: TagsIcon,
}
const deposits: SpaceNavItem = {
  href: "/admin/depots",
  label: "Dépôts",
  icon: RecycleIcon,
}
const redeems: SpaceNavItem = {
  href: "/admin/echanges",
  label: "Échanges",
  icon: SparklesIcon,
}
const settings: SpaceNavItem = {
  href: "/admin/parametres",
  label: "Paramètres",
  icon: SettingsIcon,
}

export const GVB_GROUPS: WorkspaceGroup[] = [
  { label: "Pilotage", items: [dashboard, users] },
  { label: "Réseau", items: [partners, shops, materials] },
  { label: "Activité", items: [deposits, redeems] },
  { label: "Réglages", items: [settings] },
]

export const GVB_MOBILE: SpaceNavItem[] = [
  dashboard,
  partners,
  shops,
  deposits,
  redeems,
]

export const GVB_MORE: SpaceNavItem[] = [users, materials, settings]
