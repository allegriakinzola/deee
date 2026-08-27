import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { NetworkShopsDirectory } from "@/components/gvb/network-shops-directory"
import { canViewNetworkShops } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listNetworkShops } from "@/modules/shops"

export const metadata: Metadata = {
  title: "Shops",
  robots: { index: false, follow: false },
}

export default async function AdminShopsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/admin/shops")
  }
  if (!canViewNetworkShops(actor.role)) {
    redirect("/interdit")
  }

  const shops = await listNetworkShops(actor)
  return <NetworkShopsDirectory shops={shops} />
}
