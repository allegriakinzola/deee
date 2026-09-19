import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { MaterialsWorkspace } from "@/components/gvb/materials-workspace"
import { canManageMaterials } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { DEFAULT_USD_PER_POINT, pointsPerBon } from "@/modules/catalog"
import { listDirectoryMaterials } from "@/modules/materials"
import { getOperatorSettings } from "@/modules/settings"

export const metadata: Metadata = {
  title: "Matériels",
  robots: { index: false, follow: false },
}

export default async function AdminMaterialsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/admin/materiels")
  }
  if (!canManageMaterials(actor.role)) {
    redirect("/interdit")
  }

  const [materials, settings] = await Promise.all([
    listDirectoryMaterials(actor),
    getOperatorSettings(actor),
  ])

  return (
    <MaterialsWorkspace
      materials={materials}
      defaults={{
        usdPerPoint: DEFAULT_USD_PER_POINT,
        bonUsdValue: settings.bonUsdValue,
        pointsPerBon: pointsPerBon(DEFAULT_USD_PER_POINT, settings.bonUsdValue),
      }}
    />
  )
}
