/** Code shop dictible au comptoir. Stocké sans tiret (6 caractères). */

export function normalizeShopCode(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
}

export function displayShopCode(code: string): string {
  const compact = normalizeShopCode(code)
  if (compact.length === 6) {
    return `${compact.slice(0, 3)}-${compact.slice(3)}`
  }
  return compact
}
