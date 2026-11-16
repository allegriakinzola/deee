import {
  LayoutDashboardIcon,
  RecycleIcon,
  SparklesIcon,
} from "lucide-react"

import type { WorkspaceGroup } from "@/components/workspace/workspace-shell"
import type { SpaceNavItem } from "@/components/workspace/space-nav"

const dashboard: SpaceNavItem = {
  href: "/shop",
  label: "Tableau de bord",
  shortLabel: "Accueil",
  icon: LayoutDashboardIcon,
}
const deposits: SpaceNavItem = {
  href: "/shop/depots",
  label: "Dépôts",
  icon: RecycleIcon,
}
const redeems: SpaceNavItem = {
  href: "/shop/echanges",
  label: "Échanges",
  icon: SparklesIcon,
}

export const SHOP_GROUPS: WorkspaceGroup[] = [
  { label: "Comptoir", items: [dashboard, deposits, redeems] },
]

export const SHOP_MOBILE: SpaceNavItem[] = [dashboard, deposits, redeems]
