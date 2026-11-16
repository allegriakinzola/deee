"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { postJson } from "@/lib/api"
import { formatPointsAndUsd, formatUsd } from "@/lib/money"
import { formatDateTimeKinshasa } from "@/lib/period"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import {
  DirectoryPagination,
  usePagedRows,
} from "@/components/directory/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DirectoryRedeem } from "@/modules/redeems"

function phrase(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function when(redeem: DirectoryRedeem) {
  return redeem.confirmedAt ?? redeem.rejectedAt ?? redeem.sentAt ?? redeem.createdAt
}

export function ShopRedeemsWorkspace({
  pending,
  done,
  usdPerPoint,
}: {
  pending: DirectoryRedeem[]
  done: DirectoryRedeem[]
  usdPerPoint: string
}) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(pending[0]?.id ?? null)
  const [status, setStatus] = useState<"ALL" | "CONFIRMED" | "REJECTED">("ALL")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const confirmed = done.filter((item) => item.status === "CONFIRMED").length
  const rejected = done.filter((item) => item.status === "REJECTED").length

  const history = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return done.filter((item) => {
      if (status !== "ALL" && item.status !== status) return false
      if (!needle) return true
      return `${item.citizenName} ${item.rewardLabel}`.toLowerCase().includes(
        needle
      )
    })
  }, [done, query, status])
  const pendingPage = usePagedRows(pending, "pending")
  const historyPage = usePagedRows(history, `${status}|${query}`)

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh()
    }, 8000)
    return () => window.clearInterval(timer)
  }, [router])

  async function confirm(redeem: DirectoryRedeem) {
    setError("")
    setBusyId(redeem.id)
    const result = await postJson(`/api/v1/redeems/${redeem.id}/confirm`)
    setBusyId(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setOpenId(null)
    router.refresh()
  }

  async function reject(redeem: DirectoryRedeem) {
    setError("")
    setBusyId(redeem.id)
    const result = await postJson(`/api/v1/redeems/${redeem.id}/reject`)
    setBusyId(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setOpenId(null)
    router.refresh()
  }

  return (
    <div className="min-w-0 w-full space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Échanges</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Vérifiez que le citoyen est au comptoir, remettez la récompense, puis
          confirmez. Les points ne sont débités qu’après confirmation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="À confirmer"
          value={pending.length}
          tone={pending.length > 0 ? "alert" : "plain"}
        />
        <StatCard label="Confirmés" value={confirmed} />
        <StatCard label="Refusés" value={rejected} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
          <h2 className="text-sm font-medium">
            File d’attente · {phrase(pending.length, "demande", "demandes")}
          </h2>
        </div>
        {pending.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Aucune demande pour l’instant. Communiquez le code du shop au
            citoyen pour qu’il envoie son échange.
          </p>
        ) : (
          <ul>
            {pendingPage.rows.map((redeem) => {
              const expanded = openId === redeem.id
              return (
                <li
                  key={redeem.id}
                  className="border-t border-border/70 first:border-t-0"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-muted/30"
                    onClick={() => setOpenId(expanded ? null : redeem.id)}
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{redeem.citizenName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {redeem.rewardLabel} ·{" "}
                        {redeem.bons === 1 ? "1 bon" : `${redeem.bons} bons`}
                      </p>
                    </div>
                    <p className="hidden shrink-0 text-sm tabular-nums sm:block">
                      {formatUsd(redeem.usdValue)}
                    </p>
                    <p className="hidden shrink-0 text-xs text-muted-foreground md:block">
                      {formatDateTimeKinshasa(new Date(when(redeem)))}
                    </p>
                    <Badge>À confirmer</Badge>
                  </button>
                  {expanded ? (
                    <div className="space-y-4 border-t border-border/80 bg-muted/20 px-4 py-4">
                      <div className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          À remettre
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {redeem.rewardLabel}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {redeem.bons === 1 ? "1 bon" : `${redeem.bons} bons`}{" "}
                          · {formatPointsAndUsd(redeem.points, usdPerPoint)} ·{" "}
                          {formatUsd(redeem.usdValue)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busyId === redeem.id}
                          onClick={() => void reject(redeem)}
                        >
                          Refuser
                        </Button>
                        <Button
                          type="button"
                          disabled={busyId === redeem.id}
                          onClick={() => void confirm(redeem)}
                        >
                          {busyId === redeem.id
                            ? "Confirmation…"
                            : "Confirmer l’échange"}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
        {pending.length > 0 ? (
          <DirectoryPagination
            page={pendingPage.page}
            pageCount={pendingPage.pageCount}
            total={pendingPage.total}
            from={pendingPage.from}
            to={pendingPage.to}
            emptyLabel="0 demande"
            onPage={pendingPage.setPage}
          />
        ) : null}
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              label={`Tous · ${done.length}`}
              active={status === "ALL"}
              onClick={() => setStatus("ALL")}
            />
            <FilterChip
              label={`Confirmés · ${confirmed}`}
              active={status === "CONFIRMED"}
              onClick={() => setStatus("CONFIRMED")}
            />
            <FilterChip
              label={`Refusés · ${rejected}`}
              active={status === "REJECTED"}
              onClick={() => setStatus("REJECTED")}
            />
          </div>
          <div className="relative w-full lg:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Citoyen ou offre"
              className="h-9 pl-9"
              aria-label="Rechercher dans l’historique"
            />
          </div>
        </div>

        <DirectoryTableScroll>
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Date
                </th>
                <th className="px-4 py-2.5 font-medium">Citoyen</th>
                <th className="px-4 py-2.5 font-medium">Offre</th>
                <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                  Valeur
                </th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-14 text-center text-muted-foreground"
                  >
                    {done.length === 0
                      ? "Pas encore d’historique."
                      : "Aucun échange dans cette sélection."}
                  </td>
                </tr>
              ) : (
                historyPage.rows.map((redeem) => (
                  <tr
                    key={redeem.id}
                    className="border-t border-border/60 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      {formatDateTimeKinshasa(new Date(when(redeem)))}
                    </td>
                    <td className="px-4 py-2.5 font-medium">
                      {redeem.citizenName}
                    </td>
                    <td className="px-4 py-2.5">
                      <p>{redeem.rewardLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {redeem.bons === 1 ? "1 bon" : `${redeem.bons} bons`} ·{" "}
                        {redeem.points} pts
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatUsd(redeem.usdValue)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={
                          redeem.status === "CONFIRMED" ? "default" : "secondary"
                        }
                      >
                        {redeem.status === "CONFIRMED" ? "Confirmé" : "Refusé"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DirectoryTableScroll>

        <DirectoryPagination
          page={historyPage.page}
          pageCount={historyPage.pageCount}
          total={historyPage.total}
          from={historyPage.from}
          to={historyPage.to}
          emptyLabel="0 échange"
          onPage={historyPage.setPage}
        />
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone = "plain",
}: {
  label: string
  value: number
  tone?: "plain" | "alert"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-4 ring-1",
        tone === "alert"
          ? "bg-amber-50 ring-amber-200"
          : "bg-card ring-foreground/10"
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        active
          ? "bg-foreground text-background"
          : "bg-muted/70 text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}
