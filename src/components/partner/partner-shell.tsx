"use client"

import type { ReactNode } from "react"

import { PartnerMark } from "@/components/brand/partner-mark"
import {
  PARTNER_GROUPS,
  PARTNER_MOBILE,
} from "@/components/partner/partner-nav"
import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import type { AuthUser } from "@/modules/auth"

export function PartnerShell({
  user,
  children,
}: {
  user: AuthUser
  children: ReactNode
}) {
  return (
    <WorkspaceShell
      user={user}
      homeHref="/partenaire"
      spaceLabel="Espace partenaire"
      desktopTitle={`DEEE Kinshasa — ${user.partnerName ?? "partenaire"}`}
      groups={PARTNER_GROUPS}
      mobile={PARTNER_MOBILE}
      identity={
        user.partnerName ? (
          <div className="flex items-center gap-2.5">
            <PartnerMark name={user.partnerName} logo={user.partnerLogo} />
            <p className="truncate text-sm font-medium">{user.partnerName}</p>
          </div>
        ) : null
      }
    >
      {children}
    </WorkspaceShell>
  )
}
