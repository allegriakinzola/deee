"use client"

import { useMemo, useState } from "react"

import { displayShopCode } from "@/lib/shop-code"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DirectoryDeposit } from "@/modules/deposits"

const FILTERS = [
  { id: "ALL", label: "Tous" },
  { id: "SENT", label: "Envoyés" },
  { id: "CONFIRMED", label: "Confirmés" },
  { id: "REJECTED", label: "Refusés" },
  { id: "DRAFT", label: "Brouillons" },
] as const

const STATUS_LABEL = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  CONFIRMED: "Confirmé",
  REJECTED: "Refusé",
} as const

function when(deposit: DirectoryDeposit) {
  return (
    deposit.confirmedAt ??
    deposit.rejectedAt ??
    deposit.sentAt ??
    deposit.createdAt
  )
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

export function DepositRegister({
  eyebrow,
  description,
  deposits,
  truncated,
  showPartner,
  showDrafts,
}: {
  eyebrow: string
  description: string
  deposits: DirectoryDeposit[]
  truncated: boolean
  showPartner: boolean
  showDrafts: boolean
}) {
  const filters = showDrafts
    ? FILTERS
    : FILTERS.filter((item) => item.id !== "DRAFT")
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("ALL")
  const visible = useMemo(
    () =>
      deposits.filter((item) => filter === "ALL" || item.status === filter),
    [deposits, filter]
  )
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of deposits) {
      map.set(item.status, (map.get(item.status) ?? 0) + 1)
    }
    return map
  }, [deposits])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dépôts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const count =
            item.id === "ALL" ? deposits.length : (counts.get(item.id) ?? 0)
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
          Les 200 dépôts les plus récents sont affichés.
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-10 text-center text-muted-foreground ring-1 ring-foreground/10">
          Aucun dépôt dans cette sélection.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((deposit) => (
            <li
              key={deposit.id}
              className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{deposit.citizenName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {deposit.shopName ?? "Pas encore envoyé"}
                    {deposit.shopArea ? ` · ${deposit.shopArea}` : ""}
                    {showPartner && deposit.partnerName
                      ? ` · ${deposit.partnerName}`
                      : ""}
                    {deposit.shopCode
                      ? ` · ${displayShopCode(deposit.shopCode)}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      deposit.status === "CONFIRMED" ? "default" : "secondary"
                    }
                  >
                    {STATUS_LABEL[deposit.status]}
                  </Badge>
                  <p className="mt-2 text-sm font-medium">
                    {deposit.pointsTotal} pts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(when(deposit))}
                  </p>
                </div>
              </div>
              {deposit.lines.length > 0 ? (
                <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm">
                  {deposit.lines.map((line) => (
                    <li
                      key={line.id}
                      className="flex justify-between gap-3 text-muted-foreground"
                    >
                      <span>
                        {line.name} · {line.quantity}
                      </span>
                      <span>{line.pointsTotal} pts</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                  Aucun matériel sur ce dépôt.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
