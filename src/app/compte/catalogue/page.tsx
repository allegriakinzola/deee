import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CitizenCatalog } from "@/components/citizen/citizen-catalog"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { DEFAULT_USD_PER_POINT, pointsPerBon } from "@/modules/catalog"
import { listPickupMaterials } from "@/modules/materials"
import { readBonUsdValue } from "@/modules/settings"

export const metadata: Metadata = {
  title: "Catalogue",
  robots: { index: false, follow: false },
}

export default async function CitizenCatalogPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/compte/catalogue")
  }
  if (!canAccessCitizenSpace(actor.role)) {
    redirect("/interdit")
  }

  const [materials, bonUsd] = await Promise.all([
    listPickupMaterials(actor),
    readBonUsdValue(),
  ])

  return (
    <CitizenCatalog
      materials={materials}
      pointsPerBon={pointsPerBon(DEFAULT_USD_PER_POINT, bonUsd)}
      bonUsd={bonUsd}
    />
  )
}
