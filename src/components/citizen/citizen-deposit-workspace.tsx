"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MinusIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"

import { CitizenPageHeader, CitizenSection } from "@/components/citizen/citizen-page"
import {
  DirectoryPagination,
  usePagedRows,
} from "@/components/directory/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { deleteJson, patchJson, postJson } from "@/lib/api"
import { formatPointsAndUsd, formatUsd } from "@/lib/money"
import { formatDateTimeKinshasa } from "@/lib/period"
import { displayShopCode } from "@/lib/shop-code"
import type { DirectoryDeposit } from "@/modules/deposits"
import type { DirectoryMaterial } from "@/modules/materials"

export function CitizenDepositWorkspace({
  materials,
  draft,
  history,
  usdPerPoint,
}: {
  materials: DirectoryMaterial[]
  draft: DirectoryDeposit
  history: DirectoryDeposit[]
  usdPerPoint: string
}) {
  const router = useRouter()
  const [shopCode, setShopCode] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [busyMaterial, setBusyMaterial] = useState<string | null>(null)
  const [busyDeposit, setBusyDeposit] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Tous")
  const [basketOpen, setBasketOpen] = useState(false)

  const awaitingShop = useMemo(
    () => history.filter((item) => item.status === "SENT"),
    [history]
  )
  const past = useMemo(
    () => history.filter((item) => item.status !== "SENT"),
    [history]
  )
  const pastPage = usePagedRows(past, "history")

  useEffect(() => {
    if (awaitingShop.length === 0) {
      return
    }
    const timer = window.setInterval(() => {
      router.refresh()
    }, 8000)
    return () => window.clearInterval(timer)
  }, [awaitingShop.length, router])

  const qtyByMaterial = useMemo(() => {
    const map = new Map<string, number>()
    for (const line of draft.lines) {
      map.set(line.materialId, line.quantity)
    }
    return map
  }, [draft.lines])

  const groups = useMemo(() => {
    const byCategory = new Map<string, DirectoryMaterial[]>()
    for (const item of materials) {
      const list = byCategory.get(item.category) ?? []
      list.push(item)
      byCategory.set(item.category, list)
    }
    return [...byCategory.entries()]
  }, [materials])

  const categories = useMemo(
    () => ["Tous", ...groups.map(([name]) => name)],
    [groups]
  )

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return groups.flatMap(([name, items]) => {
      if (category !== "Tous" && name !== category) {
        return []
      }
      const filtered = needle
        ? items.filter((item) => item.name.toLowerCase().includes(needle))
        : items
      return filtered.length > 0 ? [[name, filtered] as const] : []
    })
  }, [category, groups, query])

  const articleCount = draft.lines.reduce((sum, line) => sum + line.quantity, 0)

  async function setQuantity(materialId: string, quantity: number) {
    setError("")
    setBusyMaterial(materialId)
    const result = await patchJson<DirectoryDeposit>("/api/v1/deposits/draft", {
      materialId,
      quantity,
    })
    setBusyMaterial(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.refresh()
  }

  async function send() {
    setError("")
    setPending(true)
    const result = await postJson<DirectoryDeposit>(
      "/api/v1/deposits/draft/send",
      { shopCode }
    )
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setShopCode("")
    router.refresh()
  }

  async function cancel(depositId: string) {
    setError("")
    setBusyDeposit(depositId)
    const result = await deleteJson<{ id: string }>(
      `/api/v1/deposits/${depositId}`
    )
    setBusyDeposit(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.refresh()
  }

  const basket = (
    <DepositBasket
      draft={draft}
      usdPerPoint={usdPerPoint}
      shopCode={shopCode}
      onShopCode={setShopCode}
      pending={pending}
      busyMaterial={busyMaterial}
      busyDeposit={busyDeposit}
      onRemove={(materialId) => void setQuantity(materialId, 0)}
      onClear={() => void cancel(draft.id)}
      onSend={() => void send()}
    />
  )

  return (
    <div className="flex flex-col gap-8 pb-36 lg:gap-10 lg:pb-2">
      <CitizenPageHeader
        title="Déposer"
        description="Choisissez les appareils, puis au shop saisissez le code affiché par le responsable. Les points sont crédités seulement après sa confirmation."
      />

      {error ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {awaitingShop.length > 0 ? (
        <CitizenSection
          eyebrow="En cours"
          title={`${awaitingShop.length === 1 ? "1 dépôt" : `${awaitingShop.length} dépôts`} en attente du shop`}
          description="Le responsable vérifie les articles, puis confirme. Les points sont crédités à ce moment-là. Vous pouvez encore annuler."
        >
          <ul className="mt-3 space-y-3">
            {awaitingShop.map((item) => (
              <li key={item.id} className="rounded-xl bg-zinc-50 px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900">
                      {item.shopName ?? "Shop"}
                      {item.shopCode
                        ? ` · ${displayShopCode(item.shopCode)}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-[13px] text-zinc-500">
                      {item.shopArea ? `${item.shopArea} · ` : ""}
                      {formatPointsAndUsd(item.pointsTotal, usdPerPoint)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/35 px-2 py-0.5 text-[11px] font-medium text-zinc-900">
                    En attente
                  </span>
                </div>
                {item.lines.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-[13px] text-zinc-600">
                    {item.lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <span className="min-w-0">
                          {line.quantity} × {line.name}
                        </span>
                        <span className="shrink-0 text-zinc-500">
                          {formatPointsAndUsd(line.pointsTotal, usdPerPoint)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-9 w-full rounded-xl"
                  disabled={busyDeposit === item.id}
                  onClick={() => void cancel(item.id)}
                >
                  {busyDeposit === item.id
                    ? "Suppression…"
                    : "Supprimer ce dépôt"}
                </Button>
              </li>
            ))}
          </ul>
        </CitizenSection>
      ) : null}

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-8">
      <CitizenSection
        eyebrow="Préparation"
        title="Choisir les appareils"
        description="Ajoutez les quantités. Rien n’est envoyé tant que vous n’avez pas saisi le code du shop."
      >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un appareil"
            aria-label="Rechercher un appareil"
            className="h-11 pl-9"
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

      {visibleGroups.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500 ring-1 ring-zinc-200/80">
          Aucun appareil ne correspond à cette recherche.
        </p>
      ) : null}

      {visibleGroups.map(([groupName, items]) => (
        <section key={groupName} className="space-y-2">
          <h2 className="px-0.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            {groupName}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => {
              const qty = qtyByMaterial.get(item.id) ?? 0
              const busy = busyMaterial === item.id
              return (
                <article
                  key={item.id}
                  className={
                    qty > 0
                      ? "flex gap-3 rounded-2xl bg-white p-3 ring-2 ring-emerald-700/30"
                      : "flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-zinc-200/80"
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    className="size-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      {item.points} pts · {formatUsd(item.usdEquivalent)} / pièce
                    </p>
                    {qty > 0 ? (
                      <p className="mt-1 text-xs font-medium text-zinc-900">
                        {formatPointsAndUsd(qty * item.points, usdPerPoint)}
                      </p>
                    ) : null}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="size-10"
                        disabled={busy || qty === 0}
                        aria-label={`Retirer ${item.name}`}
                        onClick={() => void setQuantity(item.id, qty - 1)}
                      >
                        <MinusIcon className="size-4" />
                      </Button>
                      <span className="w-8 text-center text-base font-semibold tabular-nums">
                        {qty}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="size-10"
                        disabled={busy}
                        aria-label={`Ajouter ${item.name}`}
                        onClick={() => void setQuantity(item.id, qty + 1)}
                      >
                        <PlusIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
      </CitizenSection>

      {past.length > 0 ? (
        <CitizenSection
          eyebrow="Historique"
          title="Dépôts déjà traités"
          description="Confirmations et refus des shops."
        >
          <ul className="mt-3 divide-y divide-zinc-100">
            {pastPage.rows.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">
                    {item.shopName ?? "Shop"}
                    {item.shopCode
                      ? ` · ${displayShopCode(item.shopCode)}`
                      : ""}
                  </p>
                  <p className="mt-0.5 text-zinc-500">
                    {formatDateTimeKinshasa(
                      new Date(item.confirmedAt ?? item.rejectedAt ?? item.createdAt)
                    )}
                    {" · "}
                    {formatPointsAndUsd(item.pointsTotal, usdPerPoint)}
                  </p>
                </div>
                <Badge variant={item.status === "CONFIRMED" ? "default" : "secondary"}>
                  {statusLabel(item.status)}
                </Badge>
              </li>
            ))}
          </ul>
          <DirectoryPagination
            page={pastPage.page}
            pageCount={pastPage.pageCount}
            total={pastPage.total}
            from={pastPage.from}
            to={pastPage.to}
            emptyLabel="0 dépôt"
            onPage={pastPage.setPage}
          />
        </CitizenSection>
      ) : null}
        </div>
        <aside className="sticky top-0 hidden lg:block">{basket}</aside>
      </div>

      <div className="fixed inset-x-0 bottom-[4.6rem] z-30 border-t border-zinc-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900">
              {articleCount === 0
                ? "Aucun article"
                : `${articleCount} ${articleCount === 1 ? "article" : "articles"}`}
            </p>
            <p className="text-xs text-zinc-500">
              {formatPointsAndUsd(draft.pointsTotal, usdPerPoint)}
            </p>
          </div>
          <Button
            type="button"
            className="h-11 rounded-2xl"
            onClick={() => setBasketOpen(true)}
          >
            Continuer
          </Button>
        </div>
      </div>

      <Sheet open={basketOpen} onOpenChange={setBasketOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>Votre dépôt</SheetTitle>
            <SheetDescription>
              Saisissez le code du shop, puis envoyez. Le responsable confirme ensuite.
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-4">{basket}</div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DepositBasket({
  draft,
  usdPerPoint,
  shopCode,
  onShopCode,
  pending,
  busyMaterial,
  busyDeposit,
  onRemove,
  onClear,
  onSend,
}: {
  draft: DirectoryDeposit
  usdPerPoint: string
  shopCode: string
  onShopCode: (value: string) => void
  pending: boolean
  busyMaterial: string | null
  busyDeposit: string | null
  onRemove: (materialId: string) => void
  onClear: () => void
  onSend: () => void
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/90">
      <header className="border-b border-zinc-200/80 bg-zinc-50/90 px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-800 uppercase">
          Au shop
        </p>
        <p className="mt-1 text-base font-semibold text-zinc-950">Envoyer la liste</p>
      </header>
      <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Votre liste</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">
            {formatPointsAndUsd(draft.pointsTotal, usdPerPoint)}
          </p>
        </div>
        {draft.lines.length > 0 ? (
          <button
            type="button"
            className="text-sm font-medium text-red-700 disabled:opacity-50"
            disabled={busyDeposit === draft.id}
            onClick={onClear}
          >
            {busyDeposit === draft.id ? "Suppression…" : "Vider"}
          </button>
        ) : null}
      </div>
      {draft.lines.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          Ajoutez un appareil avec les boutons + .
        </p>
      ) : (
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {draft.lines.map((line) => (
            <li key={line.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium text-zinc-900">
                  {line.quantity} × {line.name}
                </span>
                <span className="text-zinc-500">
                  {formatPointsAndUsd(line.pointsTotal, usdPerPoint)}
                </span>
              </span>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
                disabled={busyMaterial === line.materialId}
                aria-label={`Enlever ${line.name}`}
                onClick={() => onRemove(line.materialId)}
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-zinc-900">Code du shop</p>
        <Input
          value={shopCode}
          onChange={(event) => onShopCode(event.target.value.toUpperCase())}
          placeholder="Ex. K7M-2PQ"
          aria-label="Code du shop"
          className="h-11 font-mono tracking-wider"
        />
        <Button
          type="button"
          className="h-11 w-full rounded-2xl"
          disabled={pending || draft.lines.length === 0}
          onClick={onSend}
        >
          {pending ? "Envoi…" : "Envoyer au shop"}
        </Button>
        <p className="text-xs leading-relaxed text-zinc-500">
          Le code est affiché par le responsable. Rien n’est crédité avant sa confirmation.
        </p>
      </div>
      </div>
    </section>
  )
}

function statusLabel(status: DirectoryDeposit["status"]) {
  if (status === "SENT") return "En attente au shop"
  if (status === "CONFIRMED") return "Confirmé"
  if (status === "REJECTED") return "Refusé"
  return "Brouillon"
}
