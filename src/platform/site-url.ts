function envValue(name: string): string {
  const value = process.env[name]
  return typeof value === "string" ? value.trim().replace(/\/$/, "") : ""
}

/** Origine publique. Lue au démarrage, pas figée dans l’image. */
export function getSiteUrl(): string {
  const configured = envValue("NEXT_PUBLIC_SITE_URL")
  if (configured) {
    return configured
  }

  const vercel =
    envValue("VERCEL_PROJECT_PRODUCTION_URL") || envValue("VERCEL_URL")
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "")
    return `https://${host}`
  }

  throw new Error("Variable d'environnement manquante : NEXT_PUBLIC_SITE_URL")
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${getSiteUrl()}${normalized}`
}
