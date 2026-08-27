import type { DirectoryPartner } from "@/modules/partners"

export const KIND_LABELS: Record<DirectoryPartner["kind"], string> = {
  TELECOM: "Télécom",
  BANK: "Banque",
  PRODUCTS: "Produits",
}

export type PartnersViewFilter =
  | "all"
  | "telecom"
  | "bank"
  | "products"
  | "disabled"

export type PartnerStats = {
  total: number
  telecom: number
  bank: number
  products: number
  disabled: number
}

export function summarizePartners(partners: DirectoryPartner[]): PartnerStats {
  return {
    total: partners.length,
    telecom: partners.filter((partner) => partner.kind === "TELECOM").length,
    bank: partners.filter((partner) => partner.kind === "BANK").length,
    products: partners.filter((partner) => partner.kind === "PRODUCTS").length,
    disabled: partners.filter((partner) => partner.status === "DISABLED").length,
  }
}

export function filterDirectoryPartners(
  partners: DirectoryPartner[],
  filter: PartnersViewFilter,
  query: string
): DirectoryPartner[] {
  const needle = query.trim().toLowerCase()
  return partners.filter((partner) => {
    if (filter === "telecom" && partner.kind !== "TELECOM") return false
    if (filter === "bank" && partner.kind !== "BANK") return false
    if (filter === "products" && partner.kind !== "PRODUCTS") return false
    if (filter === "disabled" && partner.status !== "DISABLED") return false
    if (!needle) return true
    return (
      partner.name.toLowerCase().includes(needle) ||
      partner.shortName.toLowerCase().includes(needle) ||
      partner.admins.some(
        (admin) =>
          admin.displayName.toLowerCase().includes(needle) ||
          (admin.email ?? "").toLowerCase().includes(needle)
      )
    )
  })
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

export function adminSummary(partner: DirectoryPartner): string {
  if (partner.admins.length === 0) {
    return "Aucun administrateur"
  }
  if (partner.admins.length === 1) {
    return partner.admins[0].email ?? partner.admins[0].displayName
  }
  return `${partner.admins.length} administrateurs`
}
