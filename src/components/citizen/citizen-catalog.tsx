"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { CitizenPageHeader, CitizenSection } from "@/components/citizen/citizen-page"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatUsd } from "@/lib/money"
import { cn } from "@/lib/utils"
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
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Tous")

  const categories = useMemo(() => {
    const names = [...new Set(materials.map((item) => item.category))]
    return ["Tous", ...names]
  }, [materials])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return materials.filter((item) => {
      if (category !== "Tous" && item.category !== category) {
        return false
      }
      if (!needle) {
        return true
      }
      return `${item.name} ${item.category}`.toLowerCase().includes(needle)
    })
  }, [category, materials, query])

  const groups = useMemo(() => {
    const map = new Map<string, DirectoryMaterial[]>()
    for (const material of visible) {
      const list = map.get(material.category) ?? []
      list.push(material)
      map.set(material.category, list)
    }
    return [...map.entries()]
  }, [visible])

  return (
    <div className="flex flex-col gap-8 pb-2 lg:gap-10">
      <CitizenPageHeader
        title="Catalogue"
        description={
          pointsPerBon > 0
            ? `Chaque appareil a un nombre de points fixe. 1 bon = ${pointsPerBon} points (${formatUsd(bonUsd)}). Pour déposer, passez par Déposer.`
            : "Chaque appareil a un nombre de points fixe. Pour déposer, passez par Déposer."
        }
        action={
          <Link
            href="/compte/depot"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            Préparer un dépôt
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un appareil"
            aria-label="Rechercher un appareil"
            className="h-11 bg-white pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={
                category === name
                  ? "shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white"
                  : "shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 ring-1 ring-zinc-200"
              }
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {materials.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500 ring-1 ring-zinc-200/80">
          Aucun matériel n’est ouvert au dépôt pour le moment.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500 ring-1 ring-zinc-200/80">
          Aucun appareil ne correspond à cette recherche.
        </p>
      ) : (
        groups.map(([group, items]) => (
          <CitizenSection key={group} eyebrow="Catégorie" title={group}>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-zinc-200/80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    className="size-16 shrink-0 rounded-xl object-cover sm:size-20"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {`${formatUsd(item.usdEquivalent)} / ${item.unit}`}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-800">
                      {`${item.points} pts`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CitizenSection>
        ))
      )}
    </div>
  )
}
