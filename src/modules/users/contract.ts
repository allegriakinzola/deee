import type { UserRole, UserStatus } from "@/generated/prisma/client"

export const GVB_INVITABLE_ROLES = ["GVB_ADMIN", "GVB_COLLECTOR"] as const

export type GvbInvitableRole = (typeof GVB_INVITABLE_ROLES)[number]

export const PLATFORM_INVITABLE_ROLES = [
  "GVB_ADMIN",
  "GVB_COLLECTOR",
  "PARTNER_ADMIN",
  "SHOP_STAFF",
  "CITIZEN",
] as const

export type PlatformInvitableRole = (typeof PLATFORM_INVITABLE_ROLES)[number]

export type UserAccess = "READY" | "PENDING" | "EXPIRED"

export type DirectoryUser = {
  id: string
  displayName: string
  email: string | null
  role: UserRole
  status: UserStatus
  access: UserAccess
  createdAt: string
}

export function isGvbInvitableRole(role: string): role is GvbInvitableRole {
  return (GVB_INVITABLE_ROLES as readonly string[]).includes(role)
}

export function isPlatformInvitableRole(
  role: string
): role is PlatformInvitableRole {
  return (PLATFORM_INVITABLE_ROLES as readonly string[]).includes(role)
}
