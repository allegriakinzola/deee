"use client"

import { useMemo, useState } from "react"
import { SearchIcon, StoreIcon } from "lucide-react"

import { DirectoryTableScroll } from "@/components/directory/list-layout"
import { PartnerMark } from "@/components/brand/partner-mark"
import {
  filterShops,
  operatorLabel,
  summarizeShops,
  type ShopsViewFilter,
} from "@/components/shops/shop-copy"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { DirectoryShop } from "@/modules/shops"

export function NetworkShopsDirectory({ shops }: { shops: DirectoryShop[] }) {
  const stats = useMemo(() => summarizeShops(shops), [shops])
  const [filter, setFilter] = useState<ShopsViewFilter>("all")
  const [query, setQuery] = useState("")
  const visible = useMemo(
    () => filterShops(shops, filter, query),
    [shops, filter, query]
  )

  function selectFilter(next: ShopsViewFilter) {
    setFilter((current) => (current === next && next !== "all" ? "all" : next))
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Réseau
        </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Shops</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Vue du réseau. Les partenaires créent et gèrent leurs points de dépôt.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Total"
          value={stats.total}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          label="Compte en attente"
          value={stats.pending}
          active={filter === "pending"}
          onClick={() => selectFilter("pending")}
        />
        <StatCard
          label="Désactivés"
          value={stats.disabled}
          active={filter === "disabled"}
          onClick={() => selectFilter("disabled")}
        />
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">Tous les points de dépôt</h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} shop{visible.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Shop, commune ou partenaire"
              className="h-10 pl-10"
              aria-label="Rechercher un shop"
            />
          </div>
        </div>
        <DirectoryTableScroll>
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Partenaire
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Shop</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Commune
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Compte
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    Aucun shop pour l’instant.
                  </td>
                </tr>
              ) : (
                visible.map((shop) => (
                  <tr
                    key={shop.id}
                    className="border-t border-border/60 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <PartnerMark
                          name={shop.partnerShortName || shop.partnerName}
                          logo={shop.partnerLogo}
                        />
                        <span>{shop.partnerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {shop.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{shop.area}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p>{operatorLabel(shop)}</p>
                      {shop.operator && shop.operator.access !== "READY" ? (
                        <Badge variant="secondary" className="mt-1">
                          Invitation en attente
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {shop.status === "ACTIVE" ? "Actif" : "Désactivé"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DirectoryTableScroll>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-2xl bg-card p-4 text-left ring-2 ring-emerald-700/25 transition-colors"
          : "rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] leading-tight font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <StoreIcon className="size-4 text-emerald-800/60" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
    </button>
  )
}
