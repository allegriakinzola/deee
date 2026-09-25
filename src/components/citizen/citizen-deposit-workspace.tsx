"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MinusIcon, PlusIcon, XIcon } from "lucide-react"

import { deleteJson, patchJson, postJson } from "@/lib/api"
import { formatPointsAndUsd, formatUsd } from "@/lib/money"
import { displayShopCode } from "@/lib/shop-code"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  const awaitingShop = useMemo(
    () => history.filter((item) => item.status === "SENT"),
    [history]
  )
  const past = useMemo(
    () => history.filter((item) => item.status !== "SENT"),
    [history]
  )

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

  return (
    <div className="flex flex-col gap-4 pb-44 lg:pb-52">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 lg:text-2xl">
          Dépôt
        </h1>
        <p className="mt-0.5 text-[13px] text-zinc-500 lg:text-sm">
          Présélectionnez vos articles. Ce n’est pas encore un dépôt. Au shop,
          saisissez le code du responsable puis envoyez.
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {awaitingShop.length > 0 ? (
        <section className="rounded-2xl bg-white px-4 py-4 lg:px-5">
          <p className="text-sm font-semibold text-zinc-900">
            En attente de validation · {awaitingShop.length}
          </p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Le responsable du shop doit vérifier les articles et confirmer.
            Les points seront crédités à ce moment-là. Vous pouvez encore
            annuler tout le dépôt.
          </p>
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
        </section>
      ) : null}

      {groups.map(([category, items]) => (
        <section key={category} className="space-y-2">
          <h2 className="px-0.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            {category}
          </h2>
          <div className="grid gap-2 lg:grid-cols-2">
            {items.map((item) => {
              const qty = qtyByMaterial.get(item.id) ?? 0
              const busy = busyMaterial === item.id
              return (
                <article
                  key={item.id}
                  className="flex gap-3 rounded-2xl bg-white p-3"
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
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={busy || qty === 0}
                        aria-label={`Retirer ${item.name}`}
                        onClick={() => void setQuantity(item.id, qty - 1)}
                      >
                        <MinusIcon className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {qty}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={busy}
                        aria-label={`Ajouter ${item.name}`}
                        onClick={() => void setQuantity(item.id, qty + 1)}
                      >
                        <PlusIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      {past.length > 0 ? (
        <section className="rounded-2xl bg-white px-4 py-4">
          <p className="text-sm font-semibold text-zinc-900">Historique</p>
          <ul className="mt-3 space-y-3">
            {past.map((item) => (
              <li key={item.id} className="text-sm">
                <p className="font-medium text-zinc-900">
                  {item.shopName ?? "Shop"}
                  {item.shopCode
                    ? ` · ${displayShopCode(item.shopCode)}`
                    : ""}
                </p>
                <p className="text-zinc-500">
                  {statusLabel(item.status)} ·{" "}
                  {formatPointsAndUsd(item.pointsTotal, usdPerPoint)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="fixed inset-x-0 bottom-[4.6rem] z-20 border-t border-zinc-200/80 bg-white px-4 py-3 lg:bottom-0 lg:left-64 lg:px-10">
        <div className="lg:mx-auto lg:max-w-5xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-900">
              Votre liste ·{" "}
              {formatPointsAndUsd(draft.pointsTotal, usdPerPoint)}
            </p>
            {draft.lines.length > 0 ? (
              <button
                type="button"
                className="text-[13px] font-medium text-red-700 disabled:opacity-50"
                disabled={busyDeposit === draft.id}
                onClick={() => void cancel(draft.id)}
              >
                {busyDeposit === draft.id ? "Suppression…" : "Vider le dépôt"}
              </button>
            ) : null}
          </div>
          {draft.lines.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              Aucun article pour l’instant.
            </p>
          ) : (
            <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto">
              {draft.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate font-medium text-zinc-900">
                    {line.quantity} × {line.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-zinc-500">
                    {formatPointsAndUsd(line.pointsTotal, usdPerPoint)}
                    <button
                      type="button"
                      className="flex size-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
                      disabled={busyMaterial === line.materialId}
                      aria-label={`Enlever ${line.name}`}
                      onClick={() => void setQuantity(line.materialId, 0)}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={shopCode}
              onChange={(event) => setShopCode(event.target.value.toUpperCase())}
              placeholder="Code shop, ex. K7M-2PQ"
              aria-label="Code du shop"
              className="h-11 font-mono tracking-wider"
            />
            <Button
              type="button"
              className="h-11 shrink-0 rounded-2xl"
              disabled={pending || draft.lines.length === 0}
              onClick={() => void send()}
            >
              {pending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function statusLabel(status: DirectoryDeposit["status"]) {
  if (status === "SENT") return "En attente au shop"
  if (status === "CONFIRMED") return "Confirmé"
  if (status === "REJECTED") return "Refusé"
  return "Brouillon"
}
