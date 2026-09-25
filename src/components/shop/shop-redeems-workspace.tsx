"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { postJson } from "@/lib/api"
import { formatPointsAndUsd, formatUsd } from "@/lib/money"
import { displayShopCode } from "@/lib/shop-code"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DirectoryRedeem } from "@/modules/redeems"

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
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

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
    <div className="mx-auto min-w-0 max-w-4xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Récompenses
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Échanges</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Vérifiez que le citoyen est au comptoir, remettez la récompense, puis
          confirmez. Les points ne sont débités qu’après confirmation.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-sm font-medium">En attente · {pending.length}</h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl bg-card px-4 py-10 text-center text-muted-foreground ring-1 ring-foreground/10">
            Aucune demande pour l’instant. Communiquez le code du shop au
            citoyen pour qu’il envoie son échange.
          </p>
        ) : (
          pending.map((redeem) => {
            const expanded = openId === redeem.id
            return (
              <article
                key={redeem.id}
                className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  onClick={() => setOpenId(expanded ? null : redeem.id)}
                >
                  <div>
                    <p className="font-medium">{redeem.citizenName}</p>
                    <p className="text-sm text-muted-foreground">
                      {redeem.rewardLabel}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {redeem.bons} bon{redeem.bons === 1 ? "" : "s"} ·{" "}
                      {formatPointsAndUsd(redeem.points, usdPerPoint)} ·{" "}
                      {formatUsd(redeem.usdValue)}
                    </p>
                  </div>
                  <Badge>À confirmer</Badge>
                </button>
                {expanded ? (
                  <div className="space-y-3 border-t border-border/80 px-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Remettez « {redeem.rewardLabel} » — {redeem.bons} bon
                      {redeem.bons === 1 ? "" : "s"} (
                      {formatPointsAndUsd(redeem.points, usdPerPoint)} ·{" "}
                      {formatUsd(redeem.usdValue)}), puis confirmez.
                    </p>
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
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
              </article>
            )
          })
        )}
      </section>

      {done.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Historique</h2>
          <ul className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
            {done.map((redeem) => (
              <li
                key={redeem.id}
                className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 first:border-t-0"
              >
                <div>
                  <p className="font-medium">{redeem.citizenName}</p>
                  <p className="text-sm text-muted-foreground">
                    {redeem.rewardLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {redeem.bons} bon{redeem.bons === 1 ? "" : "s"} ·{" "}
                    {formatPointsAndUsd(redeem.points, usdPerPoint)} ·{" "}
                    {formatUsd(redeem.usdValue)}
                    {redeem.shopCode
                      ? ` · ${displayShopCode(redeem.shopCode)}`
                      : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    redeem.status === "CONFIRMED" ? "default" : "secondary"
                  }
                >
                  {redeem.status === "CONFIRMED" ? "Confirmé" : "Refusé"}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
