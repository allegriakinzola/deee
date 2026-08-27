import type { DirectoryShop } from "@/modules/shops"

export type ShopsViewFilter = "all" | "active" | "pending" | "disabled"

export type ShopStats = {
  total: number
  pending: number
  disabled: number
}

export function summarizeShops(shops: DirectoryShop[]): ShopStats {
  return {
    total: shops.length,
    pending: shops.filter(
      (shop) => shop.operator !== null && shop.operator.access !== "READY"
    ).length,
    disabled: shops.filter((shop) => shop.status === "DISABLED").length,
  }
}

export function filterShops(
  shops: DirectoryShop[],
  filter: ShopsViewFilter,
  query: string
): DirectoryShop[] {
  const needle = query.trim().toLowerCase()
  return shops.filter((shop) => {
    if (filter === "active" && shop.status !== "ACTIVE") return false
    if (
      filter === "pending" &&
      !(shop.operator && shop.operator.access !== "READY")
    ) {
      return false
    }
    if (filter === "disabled" && shop.status !== "DISABLED") return false
    if (!needle) return true
    return (
      shop.name.toLowerCase().includes(needle) ||
      shop.area.toLowerCase().includes(needle) ||
      shop.partnerName.toLowerCase().includes(needle) ||
      (shop.operator?.email ?? "").toLowerCase().includes(needle) ||
      (shop.operator?.displayName ?? "").toLowerCase().includes(needle)
    )
  })
}

export function operatorLabel(shop: DirectoryShop): string {
  if (!shop.operator) {
    return "Aucun compte"
  }
  return shop.operator.email ?? shop.operator.displayName
}
