import type {
  PartnerKind,
  PartnerStatus,
  RewardKind,
} from "@/generated/prisma/client"

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
  rewardKind: RewardKind
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
