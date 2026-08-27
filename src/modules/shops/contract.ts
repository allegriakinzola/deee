import type { ShopStatus } from "@/generated/prisma/client"

import type { UserAccess } from "@/modules/users"

export type ShopOperator = {
  id: string
  displayName: string
  email: string | null
  access: UserAccess
  status: "ACTIVE" | "DISABLED"
}

export type DirectoryShop = {
  id: string
  partnerId: string
  partnerName: string
  partnerShortName: string
  partnerLogo: string | null
  name: string
  slug: string
  area: string
  lat: number
  lng: number
  status: ShopStatus
  createdAt: string
  operator: ShopOperator | null
}

export type ShopInvitationResult = {
  email: string
  invitationUrl: string
  expiresAt: string
  emailed: boolean
}
