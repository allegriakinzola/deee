import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ShopDashboardView } from "@/components/shop/shop-dashboard"
import { canAccessShopSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { getShopDashboard } from "@/modules/shops"

export const metadata: Metadata = {
  title: "Espace shop",
  robots: { index: false, follow: false },
}

export default async function ShopHomePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/shop")
  }
  if (!canAccessShopSpace(user.role, user.shopId)) {
    redirect("/interdit")
  }

  const data = await getShopDashboard(user)

  return (
    <ShopDashboardView
      displayName={user.displayName}
      shopName={user.shopName ?? "ce shop"}
      partnerName={user.partnerName}
      shopCode={user.shopCode}
      data={data}
    />
  )
}
