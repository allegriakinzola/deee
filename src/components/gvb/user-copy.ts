import type { DirectoryUser } from "@/modules/users"

export const ROLE_LABELS: Record<DirectoryUser["role"], string> = {
  GVB_ADMIN: "Administrateur GVB",
  GVB_COLLECTOR: "Collecteur",
  PARTNER_ADMIN: "Partenaire",
  SHOP_STAFF: "Shop",
  CITIZEN: "Citoyen",
}

export const ACCESS_LABELS: Record<DirectoryUser["access"], string> = {
  READY: "Compte prêt",
  PENDING: "Invitation en attente",
  EXPIRED: "Invitation expirée",
}

export type UsersViewFilter =
  | "all"
  | "admins"
  | "collectors"
  | "pending"
  | "disabled"

export type DirectoryStats = {
  total: number
  admins: number
  collectors: number
  pending: number
  disabled: number
}

export function summarizeDirectory(users: DirectoryUser[]): DirectoryStats {
  return {
    total: users.length,
    admins: users.filter((user) => user.role === "GVB_ADMIN").length,
    collectors: users.filter((user) => user.role === "GVB_COLLECTOR").length,
    pending: users.filter((user) => user.access === "PENDING").length,
    disabled: users.filter((user) => user.status === "DISABLED").length,
  }
}

export function filterDirectoryUsers(
  users: DirectoryUser[],
  filter: UsersViewFilter,
  query: string
): DirectoryUser[] {
  const needle = query.trim().toLowerCase()
  return users.filter((user) => {
    if (filter === "admins" && user.role !== "GVB_ADMIN") return false
    if (filter === "collectors" && user.role !== "GVB_COLLECTOR") return false
    if (filter === "pending" && user.access !== "PENDING") return false
    if (filter === "disabled" && user.status !== "DISABLED") return false
    if (!needle) return true
    return (
      user.displayName.toLowerCase().includes(needle) ||
      (user.email ?? "").toLowerCase().includes(needle)
    )
  })
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}
