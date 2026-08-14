export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export const SITE_NAME = "DEEE Kinshasa"

export const SITE_TITLE =
  "DEEE Kinshasa — Déposez vos déchets d’équipements électriques et électroniques"

export const SITE_DESCRIPTION =
  "Déposez téléphones, batteries et chargeurs dans un shop à Kinshasa, gagnez des points, puis échangez-les contre du crédit, des mégas, un produit ou un service. Recyclez Kinshasa."

export const SITE_KEYWORDS = [
  "DEEE Kinshasa",
  "recyclage Kinshasa",
  "déchets électriques",
  "déchets électroniques",
  "déchets d’équipements électriques et électroniques",
  "collecte DEEE",
  "points recyclage",
  "Vodacom",
  "Airtel",
  "Orange",
  "Equity BCDC",
  "Rawbank",
  "Bracongo",
]
