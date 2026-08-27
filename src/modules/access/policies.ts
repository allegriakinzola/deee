import type { UserRole } from "@/generated/prisma/client"

const READY_HOME: Partial<Record<UserRole, string>> = {
  GVB_ADMIN: "/admin",
  PARTNER_ADMIN: "/partenaire",
  SHOP_STAFF: "/shop",
  CITIZEN: "/compte",
}

export function homePathFor(role: UserRole): string {
  return READY_HOME[role] ?? "/interdit"
}

export function canAccessGvbAdmin(role: UserRole): boolean {
  return role === "GVB_ADMIN"
}

export function canManageUsers(role: UserRole): boolean {
  return role === "GVB_ADMIN"
}

export function canManagePartners(role: UserRole): boolean {
  return role === "GVB_ADMIN"
}

export function canViewNetworkShops(role: UserRole): boolean {
  return role === "GVB_ADMIN"
}

export function canManageOwnShops(
  role: UserRole,
  partnerId: string | null
): boolean {
  return role === "PARTNER_ADMIN" && Boolean(partnerId)
}

export function canManagePartnerMembers(
  role: UserRole,
  actorPartnerId: string | null,
  targetPartnerId: string
): boolean {
  if (role === "GVB_ADMIN") {
    return true
  }
  return role === "PARTNER_ADMIN" && actorPartnerId === targetPartnerId
}

export function canAccessPartnerAdmin(
  role: UserRole,
  partnerId: string | null
): boolean {
  return role === "PARTNER_ADMIN" && Boolean(partnerId)
}

export function canAccessShopSpace(
  role: UserRole,
  shopId: string | null
): boolean {
  return role === "SHOP_STAFF" && Boolean(shopId)
}

export function canAccessCitizenSpace(role: UserRole): boolean {
  return role === "CITIZEN"
}
