"use client"

import { useMemo, useState } from "react"

import { formatUsd } from "@/lib/money"
import { displayShopCode } from "@/lib/shop-code"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DirectoryRedeem } from "@/modules/redeems"

const FILTERS = [
  { id: "ALL", label: "Tous" },
  { id: "SENT", label: "Envoyés" },
  { id: "CONFIRMED", label: "Confirmés" },
  { id: "REJECTED", label: "Refusés" },
] as const

const STATUS_LABEL = {
  SENT: "Envoyé",
  CONFIRMED: "Confirmé",
  REJECTED: "Refusé",
} as const

function when(redeem: DirectoryRedeem) {
  return redeem.confirmedAt ?? redeem.rejectedAt ?? redeem.sentAt
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

export function RedeemRegister({
  eyebrow,
  description,
  redeems,
  truncated,
  showPartner,
}: {
  eyebrow: string
  description: string
  redeems: DirectoryRedeem[]
  truncated: boolean
  showPartner: boolean
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("ALL")
  const visible = useMemo(
    () => redeems.filter((item) => filter === "ALL" || item.status === filter),
    [filter, redeems]
  )
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of redeems) {
      map.set(item.status, (map.get(item.status) ?? 0) + 1)
    }
    return map
  }, [redeems])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Échanges</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const count =
            item.id === "ALL" ? redeems.length : (counts.get(item.id) ?? 0)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                filter === item.id
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground ring-1 ring-foreground/10"
              )}
            >
              {item.label} · {count}
            </button>
          )
        })}
      </div>

      {truncated ? (
        <p className="text-sm text-muted-foreground">
          Les 200 échanges les plus récents sont affichés.
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-10 text-center text-muted-foreground ring-1 ring-foreground/10">
          Aucun échange dans cette sélection.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((redeem) => (
            <li
              key={redeem.id}
              className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{redeem.rewardLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {redeem.citizenName} · {redeem.shopName}
                    {showPartner && redeem.partnerName
                      ? ` · ${redeem.partnerName}`
                      : ""}
                    {` · ${displayShopCode(redeem.shopCode)}`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      redeem.status === "CONFIRMED" ? "default" : "secondary"
                    }
                  >
                    {STATUS_LABEL[redeem.status]}
                  </Badge>
                  <p className="mt-2 text-sm font-medium">
                    {redeem.bons} bon{redeem.bons === 1 ? "" : "s"} ·{" "}
                    {redeem.points} pts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatUsd(redeem.usdValue)} · {formatWhen(when(redeem))}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
