import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ShopRedeemsWorkspace } from "@/components/shop/shop-redeems-workspace"
import { canAccessShopSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { DEFAULT_USD_PER_POINT } from "@/modules/catalog"
import { listShopRedeemInbox } from "@/modules/redeems"

export const metadata: Metadata = {
  title: "Échanges",
  robots: { index: false, follow: false },
}

export default async function ShopRedeemsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/shop/echanges")
  }
  if (!canAccessShopSpace(actor.role, actor.shopId)) {
    redirect("/interdit")
  }

  const inbox = await listShopRedeemInbox(actor)

  return (
    <ShopRedeemsWorkspace
      pending={inbox.pending}
      done={inbox.done}
      usdPerPoint={DEFAULT_USD_PER_POINT}
    />
  )
}
