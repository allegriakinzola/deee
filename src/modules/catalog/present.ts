import { pointsPerBon, usdFromPoints } from "./conversion"
import type {
  DirectoryCatalog,
  DirectoryCatalogDetail,
  DirectoryCatalogItem,
} from "./contract"

type CatalogRow = {
  id: string
  name: string
  slug: string
  description: string | null
  usdPerPoint: { toString(): string }
  status: DirectoryCatalog["status"]
  createdAt: Date
  _count?: { items: number }
  items?: Array<{
    id: string
    category: string
    name: string
    description: string | null
    unit: string
    points: number
    remarks: string | null
    status: DirectoryCatalog["status"]
  }>
}

export function toDirectoryCatalog(
  catalog: CatalogRow,
  bonUsdValue: string,
  itemCount = catalog._count?.items ?? catalog.items?.length ?? 0
): DirectoryCatalog {
  const usdPerPoint = catalog.usdPerPoint.toString()

  return {
    id: catalog.id,
    name: catalog.name,
    slug: catalog.slug,
    description: catalog.description,
    usdPerPoint,
    bonUsdValue,
    pointsPerBon: pointsPerBon(usdPerPoint, bonUsdValue),
    status: catalog.status,
    itemCount,
    createdAt: catalog.createdAt.toISOString(),
  }
}

export function toDirectoryCatalogItem(
  item: NonNullable<CatalogRow["items"]>[number],
  usdPerPoint: string
): DirectoryCatalogItem {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    unit: item.unit,
    points: item.points,
    usdEquivalent: usdFromPoints(item.points, usdPerPoint),
    remarks: item.remarks,
    status: item.status,
  }
}

export function toDirectoryCatalogDetail(
  catalog: CatalogRow & { items: NonNullable<CatalogRow["items"]> },
  bonUsdValue: string
): DirectoryCatalogDetail {
  const summary = toDirectoryCatalog(catalog, bonUsdValue, catalog.items.length)
  return {
    ...summary,
    items: catalog.items.map((item) =>
      toDirectoryCatalogItem(item, summary.usdPerPoint)
    ),
  }
}
