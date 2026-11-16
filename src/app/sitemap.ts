import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/seo"

export const dynamic = "force-dynamic"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}
