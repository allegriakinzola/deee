import type { Metadata } from "next"

import { CitizenPageHeader } from "@/components/citizen/citizen-page"
import { CitizenShopsList } from "@/components/citizen/citizen-shops-list"
import { listPublicDirectory } from "@/modules/shops"

export const metadata: Metadata = {
  title: "Shops",
  robots: { index: false, follow: false },
}

export default async function CitizenShopsPage() {
  const { shops } = await listPublicDirectory()

  return (
    <div className="flex flex-col gap-8 pb-2 lg:gap-10">
      <CitizenPageHeader
        title="Shops"
        description="Points de dépôt à Kinshasa. Ouvrez l’itinéraire, puis présentez vos appareils au responsable."
      />
      <CitizenShopsList shops={shops} />
    </div>
  )
}
