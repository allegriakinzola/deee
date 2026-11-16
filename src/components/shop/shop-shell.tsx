"use client"

import type { ReactNode } from "react"

import { PartnerMark } from "@/components/brand/partner-mark"
import { SHOP_GROUPS, SHOP_MOBILE } from "@/components/shop/shop-nav"
import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import { displayShopCode } from "@/lib/shop-code"
import type { AuthUser } from "@/modules/auth"

export function ShopShell({
  user,
  children,
}: {
  user: AuthUser
  children: ReactNode
}) {
  return (
    <WorkspaceShell
      user={user}
      homeHref="/shop"
      spaceLabel="Espace shop"
      desktopTitle={`DEEE Kinshasa — ${user.shopName ?? "shop"}`}
      groups={SHOP_GROUPS}
      mobile={SHOP_MOBILE}
      identity={
        <div className="space-y-1">
          {user.shopName ? (
            <p className="truncate text-sm font-medium">{user.shopName}</p>
          ) : null}
          {user.shopCode ? (
            <p className="font-mono text-xs tracking-[0.18em] text-zinc-500">
              {displayShopCode(user.shopCode)}
            </p>
          ) : null}
          {user.partnerName ? (
            <div className="flex items-center gap-2 pt-1">
              <PartnerMark name={user.partnerName} logo={user.partnerLogo} />
              <p className="truncate text-xs text-zinc-500">{user.partnerName}</p>
            </div>
          ) : null}
        </div>
      }
    >
      {children}
    </WorkspaceShell>
  )
}
