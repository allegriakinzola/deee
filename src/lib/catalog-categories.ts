export const CATALOG_GROUPS = [
  "Téléphonie & Tablettes",
  "Informatique",
  "Batteries & Accumulateurs",
  "Câbles & Accessoires",
  "Petit électroménager",
  "Audiovisuel & Divertissement",
  "Cartes bancaires",
] as const

export type CatalogGroup = (typeof CATALOG_GROUPS)[number]

export function isCatalogGroup(value: string): value is CatalogGroup {
  return (CATALOG_GROUPS as readonly string[]).includes(value)
}
