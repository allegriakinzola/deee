import type { PartnerKind, PartnerStatus } from "@/generated/prisma/client"

import type { UserAccess } from "@/modules/users"

export type DirectoryPartnerAdmin = {
  id: string
  displayName: string
  email: string | null
  access: UserAccess
  status: "ACTIVE" | "DISABLED"
}

export type DirectoryPartner = {
  id: string
  name: string
  shortName: string
  slug: string
  kind: PartnerKind
  logo: string | null
  status: PartnerStatus
  createdAt: string
  admins: DirectoryPartnerAdmin[]
}

export type PartnerInvitationResult = {
  email: string
  invitationUrl: string
  expiresAt: string
  emailed: boolean
}
