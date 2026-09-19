export function slugifyCatalogName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "catalogue"
}

export const DEFAULT_CATALOG_SLUG = "bareme-deee"
