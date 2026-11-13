import { formatUsd } from "@/lib/money"
import type { DirectoryMaterial } from "@/modules/materials"

export function CitizenCatalog({
  materials,
  pointsPerBon,
  bonUsd,
}: {
  materials: DirectoryMaterial[]
  pointsPerBon: number
  bonUsd: string
}) {
  const groups = new Map<string, DirectoryMaterial[]>()
  for (const material of materials) {
    const list = groups.get(material.category) ?? []
    list.push(material)
    groups.set(material.category, list)
  }

  return (
    <div className="flex flex-col gap-3 pb-2 lg:gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 lg:text-2xl">
          Catalogue
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] text-zinc-500 lg:text-sm">
          Chaque appareil accepté a un nombre de points fixe.{" "}
          {pointsPerBon > 0
            ? `1 bon = ${pointsPerBon} points (${formatUsd(bonUsd)}).`
            : "La valeur d’un bon se règle côté GVB."}{" "}
          Préparez le dépôt, puis apportez l’appareil en shop.
        </p>
      </div>

      {materials.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500">
          Aucun matériel n’est ouvert au dépôt pour le moment.
        </p>
      ) : (
        [...groups.entries()].map(([category, items]) => (
          <section key={category} className="rounded-2xl bg-white px-3.5 py-3 lg:px-5 lg:py-5">
            <h2 className="text-sm font-semibold text-zinc-900 lg:text-base">
              {category}
            </h2>
            <ul className="mt-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-t border-zinc-100 py-2.5 first:border-t-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-zinc-500 lg:text-sm">
                      {formatUsd(item.usdEquivalent)} / {item.unit}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-zinc-900">
                    {item.points} pts
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
