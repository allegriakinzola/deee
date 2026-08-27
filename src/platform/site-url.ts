/** Origine publique — toujours `NEXT_PUBLIC_SITE_URL` (.env). Jamais de fallback en dur. */
export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (!value) {
    throw new Error("Variable d'environnement manquante : NEXT_PUBLIC_SITE_URL")
  }
  return value
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${getSiteUrl()}${normalized}`
}
