import type { DirectoryPartnerAdmin } from "@/modules/partners"

export const ACCESS_LABELS: Record<DirectoryPartnerAdmin["access"], string> = {
  READY: "Compte prêt",
  PENDING: "Invitation en attente",
  EXPIRED: "Invitation expirée",
}

export type PartnerUsersViewFilter = "all" | "pending" | "disabled"

export type PartnerUserStats = {
  total: number
  pending: number
  disabled: number
}

export function summarizePartnerUsers(
  users: DirectoryPartnerAdmin[]
): PartnerUserStats {
  return {
    total: users.length,
    pending: users.filter((user) => user.access === "PENDING").length,
    disabled: users.filter((user) => user.status === "DISABLED").length,
  }
}

export function filterPartnerUsers(
  users: DirectoryPartnerAdmin[],
  filter: PartnerUsersViewFilter,
  query: string
): DirectoryPartnerAdmin[] {
  const needle = query.trim().toLowerCase()
  return users.filter((user) => {
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
