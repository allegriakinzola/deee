"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { MapPinIcon, SearchIcon } from "lucide-react"

import { CitizenSection } from "@/components/citizen/citizen-page"
import {
  DirectoryPagination,
  usePagedRows,
} from "@/components/directory/pagination"
import { Input } from "@/components/ui/input"
import type { PublicDirectory } from "@/modules/shops"

export function CitizenShopsList({
  shops,
}: {
  shops: PublicDirectory["shops"]
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return shops
    }
    return shops.filter((shop) =>
      `${shop.name} ${shop.area} ${shop.partnerName}`.toLowerCase().includes(needle)
    )
  }, [query, shops])
  const paged = usePagedRows(filtered, query)

  if (shops.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500 ring-1 ring-zinc-200/80">
        Aucun shop actif pour le moment.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, commune ou partenaire"
          aria-label="Rechercher un shop"
          className="h-11 bg-white pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500 ring-1 ring-zinc-200/80">
          Aucun shop ne correspond à cette recherche.
        </p>
      ) : (
        <CitizenSection
          eyebrow="Réseau"
          title="Points de dépôt ouverts"
          description={`${filtered.length === 1 ? "1 shop" : `${filtered.length} shops`} à Kinshasa. L’itinéraire s’ouvre dans une nouvelle fenêtre.`}
        >
        <div className="-mx-4 overflow-hidden sm:-mx-6">
          <ul className="grid sm:grid-cols-2 xl:grid-cols-3">
            {paged.rows.map((shop) => (
              <li key={shop.id} className="border-b border-zinc-100 sm:border-r">
                <Link
                  href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-full items-center gap-3 px-4 py-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <MapPinIcon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-zinc-900">
                      {shop.name}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-zinc-500">
                      {shop.area}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-zinc-400">
                      {shop.partnerName}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-emerald-800">
                    Y aller
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <DirectoryPagination
            page={paged.page}
            pageCount={paged.pageCount}
            total={paged.total}
            from={paged.from}
            to={paged.to}
            emptyLabel="0 shop"
            onPage={paged.setPage}
          />
        </div>
        </CitizenSection>
      )}
    </div>
  )
}
