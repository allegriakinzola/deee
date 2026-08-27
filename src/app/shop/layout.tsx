import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { ShopShell } from "@/components/shop/shop-shell"
import { canAccessShopSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export default async function ShopLayout({
  children,
}: { children: ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/shop")
  }
  if (!canAccessShopSpace(user.role, user.shopId)) {
    redirect("/interdit")
  }

  return <ShopShell user={user}>{children}</ShopShell>
}
