"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MinusIcon, PlusIcon, SearchIcon } from "lucide-react"

import { postJson } from "@/lib/api"
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
import type { DirectoryDeposit } from "@/modules/deposits"

function phrase(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function materialSummary(deposit: DirectoryDeposit) {
  if (deposit.lines.length === 0) return "Aucun matériel"
  const shown = deposit.lines
    .slice(0, 2)
    .map((line) => `${line.name} ×${line.quantity}`)
  const rest = deposit.lines.length - shown.length
  return rest > 0 ? `${shown.join(" · ")} · +${rest}` : shown.join(" · ")
}

function when(deposit: DirectoryDeposit) {
  return (
    deposit.confirmedAt ??
    deposit.rejectedAt ??
    deposit.sentAt ??
    deposit.createdAt
  )
}

export function ShopDepositsWorkspace({
  pending,
  done,
}: {
  pending: DirectoryDeposit[]
  done: DirectoryDeposit[]
}) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(pending[0]?.id ?? null)
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null)
  const [status, setStatus] = useState<"ALL" | "CONFIRMED" | "REJECTED">("ALL")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<string, number>>({})

  const open = pending.find((item) => item.id === openId) ?? null
  const confirmed = done.filter((item) => item.status === "CONFIRMED").length
  const rejected = done.filter((item) => item.status === "REJECTED").length

  const history = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return done.filter((item) => {
      if (status !== "ALL" && item.status !== status) return false
      if (!needle) return true
      return `${item.citizenName} ${materialSummary(item)}`.toLowerCase().includes(
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

  useEffect(() => {
    if (!open) {
      setQty({})
      return
    }
    const next: Record<string, number> = {}
    for (const line of open.lines) {
      next[line.materialId] = line.quantity
    }
    setQty(next)
  }, [open])

  async function confirm(deposit: DirectoryDeposit) {
    const lines = Object.entries(qty)
      .filter(([, quantity]) => quantity > 0)
      .map(([materialId, quantity]) => ({ materialId, quantity }))
    setError("")
    setBusyId(deposit.id)
    const result = await postJson(`/api/v1/deposits/${deposit.id}/confirm`, {
      lines,
    })
    setBusyId(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setOpenId(null)
    router.refresh()
  }

  async function reject(deposit: DirectoryDeposit) {
    setError("")
    setBusyId(deposit.id)
    const result = await postJson(`/api/v1/deposits/${deposit.id}/reject`)
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
        <h1 className="text-3xl font-semibold tracking-tight">Dépôts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Vérifiez les articles apportés, ajustez les quantités, puis
          confirmez. Les points ne sont crédités qu’après confirmation.
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
            citoyen pour qu’il envoie sa liste.
          </p>
        ) : (
          <ul>
            {pendingPage.rows.map((deposit) => {
              const expanded = openId === deposit.id
              return (
                <li
                  key={deposit.id}
                  className="border-t border-border/70 first:border-t-0"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-muted/30"
                    onClick={() => setOpenId(expanded ? null : deposit.id)}
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{deposit.citizenName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {materialSummary(deposit)}
                      </p>
                    </div>
                    <p className="hidden shrink-0 text-sm tabular-nums sm:block">
                      {deposit.pointsTotal} pts
                    </p>
                    <p className="hidden shrink-0 text-xs text-muted-foreground md:block">
                      {formatDateTimeKinshasa(new Date(when(deposit)))}
                    </p>
                    <Badge>À confirmer</Badge>
                  </button>
                  {expanded ? (
                    <div className="space-y-3 border-t border-border/80 bg-muted/20 px-4 py-4">
                      {deposit.lines.map((line) => (
                        <LineRow
                          key={line.materialId}
                          name={line.name}
                          image={line.image}
                          quantity={qty[line.materialId] ?? line.quantity}
                          onChange={(value) =>
                            setQty((current) => ({
                              ...current,
                              [line.materialId]: value,
                            }))
                          }
                        />
                      ))}
                      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busyId === deposit.id}
                          onClick={() => void reject(deposit)}
                        >
                          Refuser
                        </Button>
                        <Button
                          type="button"
                          disabled={busyId === deposit.id}
                          onClick={() => void confirm(deposit)}
                        >
                          {busyId === deposit.id
                            ? "Confirmation…"
                            : "Confirmer le dépôt"}
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
              placeholder="Citoyen ou matériel"
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
                <th className="px-4 py-2.5 font-medium">Matériels</th>
                <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                  Points
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
                      : "Aucun dépôt dans cette sélection."}
                  </td>
                </tr>
              ) : (
                historyPage.rows.map((deposit) => {
                  const expanded = historyOpenId === deposit.id
                  return (
                    <Fragment key={deposit.id}>
                      <tr
                        className="border-t border-border/60 hover:bg-muted/30"
                      >
                        <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                          {formatDateTimeKinshasa(new Date(when(deposit)))}
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {deposit.citizenName}
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            className="text-left hover:underline"
                            onClick={() =>
                              setHistoryOpenId(expanded ? null : deposit.id)
                            }
                          >
                            {materialSummary(deposit)}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {deposit.pointsTotal}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant={
                              deposit.status === "CONFIRMED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {deposit.status === "CONFIRMED"
                              ? "Confirmé"
                              : "Refusé"}
                          </Badge>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="bg-muted/20">
                          <td colSpan={5} className="px-4 py-3">
                            <ul className="space-y-2">
                              {deposit.lines.map((line) => (
                                <li
                                  key={line.id}
                                  className="flex items-center gap-3"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={line.image}
                                    alt=""
                                    className="size-10 rounded-lg object-cover"
                                  />
                                  <span className="min-w-0 flex-1 truncate text-sm">
                                    {line.name} · {line.quantity} ×{" "}
                                    {line.pointsEach} pts
                                  </span>
                                  <span className="shrink-0 text-sm tabular-nums">
                                    {line.pointsTotal} pts
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })
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
          emptyLabel="0 dépôt"
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

function LineRow({
  name,
  image,
  quantity,
  onChange,
}: {
  name: string
  image: string
  quantity: number
  onChange: (quantity: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="size-12 rounded-xl object-cover" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={quantity === 0}
          aria-label={`Retirer ${name}`}
          onClick={() => onChange(Math.max(0, quantity - 1))}
        >
          <MinusIcon className="size-3.5" />
        </Button>
        <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Ajouter ${name}`}
          onClick={() => onChange(quantity + 1)}
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
