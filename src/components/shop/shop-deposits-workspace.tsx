"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MinusIcon, PlusIcon } from "lucide-react"

import { postJson } from "@/lib/api"
import { displayShopCode } from "@/lib/shop-code"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DirectoryDeposit } from "@/modules/deposits"
import type { DirectoryMaterial } from "@/modules/materials"

export function ShopDepositsWorkspace({
  pending,
  done,
  materials,
}: {
  pending: DirectoryDeposit[]
  done: DirectoryDeposit[]
  materials: DirectoryMaterial[]
}) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(pending[0]?.id ?? null)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<string, number>>({})

  const open = pending.find((item) => item.id === openId) ?? null

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

  const extraMaterials = useMemo(() => {
    if (!open) {
      return []
    }
    const used = new Set(open.lines.map((line) => line.materialId))
    return materials.filter((item) => !used.has(item.id))
  }, [materials, open])

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
    <div className="mx-auto min-w-0 max-w-4xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Collecte
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dépôts</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Vérifiez les articles apportés, ajustez la liste, puis confirmez.
          Les points ne sont crédités qu’après confirmation.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-sm font-medium">
          En attente · {pending.length}
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl bg-card px-4 py-10 text-center text-muted-foreground ring-1 ring-foreground/10">
            Aucune demande pour l’instant. Communiquez le code du shop au
            citoyen pour qu’il envoie sa liste.
          </p>
        ) : (
          pending.map((deposit) => {
            const expanded = openId === deposit.id
            return (
              <article
                key={deposit.id}
                className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  onClick={() =>
                    setOpenId(expanded ? null : deposit.id)
                  }
                >
                  <div>
                    <p className="font-medium">{deposit.citizenName}</p>
                    <p className="text-sm text-muted-foreground">
                      {deposit.pointsTotal} pts · {deposit.lines.length}{" "}
                      article{deposit.lines.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge>À confirmer</Badge>
                </button>
                {expanded ? (
                  <div className="space-y-3 border-t border-border/80 px-4 py-4">
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
                    {extraMaterials.length > 0 ? (
                      <div>
                        <p className="mb-2 text-xs text-muted-foreground">
                          Ajouter un matériel
                        </p>
                        <select
                          className="h-11 w-full rounded-2xl border border-transparent bg-muted/70 px-4 text-sm"
                          defaultValue=""
                          onChange={(event) => {
                            const id = event.target.value
                            if (!id) {
                              return
                            }
                            setQty((current) => ({
                              ...current,
                              [id]: (current[id] ?? 0) + 1,
                            }))
                            event.target.value = ""
                          }}
                        >
                          <option value="">Choisir…</option>
                          {extraMaterials.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    {Object.entries(qty)
                      .filter(
                        ([id]) =>
                          !deposit.lines.some((line) => line.materialId === id)
                      )
                      .map(([id, quantity]) => {
                        const material = materials.find((item) => item.id === id)
                        if (!material || quantity <= 0) {
                          return null
                        }
                        return (
                          <LineRow
                            key={id}
                            name={material.name}
                            image={material.image}
                            quantity={quantity}
                            onChange={(value) =>
                              setQty((current) => ({
                                ...current,
                                [id]: value,
                              }))
                            }
                          />
                        )
                      })}
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
              </article>
            )
          })
        )}
      </section>

      {done.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Historique</h2>
          <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
            {done.map((deposit) => (
              <li
                key={deposit.id}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 first:border-t-0"
              >
                <div>
                  <p className="font-medium">{deposit.citizenName}</p>
                  <p className="text-sm text-muted-foreground">
                    {deposit.pointsTotal} pts
                    {deposit.shopCode
                      ? ` · ${displayShopCode(deposit.shopCode)}`
                      : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    deposit.status === "CONFIRMED" ? "default" : "secondary"
                  }
                >
                  {deposit.status === "CONFIRMED" ? "Confirmé" : "Refusé"}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
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
        <span className="w-6 text-center text-sm">{quantity}</span>
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
