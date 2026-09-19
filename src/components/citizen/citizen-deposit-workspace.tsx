"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MinusIcon, PlusIcon } from "lucide-react"

import { patchJson, postJson } from "@/lib/api"
import { displayShopCode } from "@/lib/shop-code"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { DirectoryDeposit } from "@/modules/deposits"
import type { DirectoryMaterial } from "@/modules/materials"

export function CitizenDepositWorkspace({
  materials,
  draft,
  history,
}: {
  materials: DirectoryMaterial[]
  draft: DirectoryDeposit
  history: DirectoryDeposit[]
}) {
  const router = useRouter()
  const [shopCode, setShopCode] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [busyMaterial, setBusyMaterial] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col gap-4 pb-2">
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

      <section className="rounded-2xl bg-white px-4 py-4 lg:px-5">
        <p className="text-sm font-semibold text-zinc-900">
          Votre liste · {draft.pointsTotal} pts
        </p>
        {draft.lines.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Aucun article pour l’instant.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {draft.lines.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-zinc-900">
                  {line.quantity} × {line.name}
                </span>
                <span className="shrink-0 text-zinc-500">
                  {line.pointsTotal} pts
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
      </section>

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
                    <p className="text-xs text-zinc-500">{item.points} pts / pièce</p>
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

      {history.length > 0 ? (
        <section className="rounded-2xl bg-white px-4 py-4">
          <p className="text-sm font-semibold text-zinc-900">Historique</p>
          <ul className="mt-3 space-y-3">
            {history.map((item) => (
              <li key={item.id} className="text-sm">
                <p className="font-medium text-zinc-900">
                  {item.shopName ?? "Shop"}
                  {item.shopCode
                    ? ` · ${displayShopCode(item.shopCode)}`
                    : ""}
                </p>
                <p className="text-zinc-500">
                  {statusLabel(item.status)} · {item.pointsTotal} pts
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function statusLabel(status: DirectoryDeposit["status"]) {
  if (status === "SENT") return "En attente au shop"
  if (status === "CONFIRMED") return "Confirmé"
  if (status === "REJECTED") return "Refusé"
  return "Brouillon"
}
