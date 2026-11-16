"use client"

import type { ReactNode } from "react"

import { GVB_GROUPS, GVB_MOBILE, GVB_MORE } from "@/components/gvb/gvb-nav"
import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import type { AuthUser } from "@/modules/auth"

export function GvbShell({
  user,
  children,
}: {
  user: AuthUser
  children: ReactNode
}) {
  return (
    <WorkspaceShell
      user={user}
      homeHref="/admin"
      spaceLabel="Espace opérateur"
      desktopTitle="DEEE Kinshasa — administration"
      groups={GVB_GROUPS}
      mobile={GVB_MOBILE}
      more={GVB_MORE}
    >
      {children}
    </WorkspaceShell>
  )
}
