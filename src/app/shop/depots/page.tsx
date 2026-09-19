import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ShopDepositsWorkspace } from "@/components/shop/shop-deposits-workspace"
import { canAccessShopSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listShopInbox } from "@/modules/deposits"
import { listPickupMaterials } from "@/modules/materials"

export const metadata: Metadata = {
  title: "Dépôts",
  robots: { index: false, follow: false },
}

export default async function ShopDepositsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/shop/depots")
  }
  if (!canAccessShopSpace(actor.role, actor.shopId)) {
    redirect("/interdit")
  }

  const [inbox, materials] = await Promise.all([
    listShopInbox(actor),
    listPickupMaterials(actor),
  ])

  return (
    <ShopDepositsWorkspace
      pending={inbox.pending}
      done={inbox.done}
      materials={materials}
    />
  )
}
