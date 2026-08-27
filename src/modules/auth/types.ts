import type { UserRole, UserStatus } from "@/generated/prisma/client"

export type AuthUser = {
  id: string
  displayName: string
  role: UserRole
  status: UserStatus
  email: string | null
  partnerId: string | null
  partnerName: string | null
  partnerLogo: string | null
  shopId: string | null
  shopName: string | null
}
