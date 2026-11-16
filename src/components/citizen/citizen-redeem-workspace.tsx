"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MinusIcon, PlusIcon } from "lucide-react"

import { CitizenPageHeader, CitizenSection } from "@/components/citizen/citizen-page"
import {
  DirectoryPagination,
  usePagedRows,
} from "@/components/directory/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getJson, postJson } from "@/lib/api"
import { formatUsd } from "@/lib/money"
import { formatDateTimeKinshasa } from "@/lib/period"
import { rewardKindLabel } from "@/lib/reward-offers"
import { displayShopCode, normalizeShopCode } from "@/lib/shop-code"
import type {
  CitizenRedeemQuote,
  DirectoryRedeem,
  ShopRedeemOffers,
} from "@/modules/redeems"

export function CitizenRedeemWorkspace({
  quote,
  history,
}: {
  quote: CitizenRedeemQuote
  history: DirectoryRedeem[]
}) {
  const router = useRouter()
  const [shopCode, setShopCode] = useState("")
  const [bons, setBons] = useState(quote.bonsAvailable >= 1 ? 1 : 0)
  const [rewardId, setRewardId] = useState("")
  const [offers, setOffers] = useState<ShopRedeemOffers | null>(null)
  const [offersError, setOffersError] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const historyPage = usePagedRows(history, "history")
  const maxBons = quote.bonsAvailable
  const selected = Math.min(bons, maxBons)
  const pointsToSpend = selected * quote.pointsPerBon
  const code = normalizeShopCode(shopCode)
  const canSend =
    selected >= 1 && code.length >= 6 && Boolean(rewardId) && Boolean(offers)

  useEffect(() => {
    if (code.length < 6) {
      setOffers(null)
      setOffersError("")
      setRewardId("")
      return
    }

    let cancelled = false
    setOffersError("")
    void getJson<ShopRedeemOffers>(
      `/api/v1/redeems/offers?shopCode=${encodeURIComponent(code)}`
    ).then((result) => {
      if (cancelled) {
        return
      }
      if (!result.ok) {
        setOffers(null)
        setRewardId("")
        setOffersError(result.message)
        return
      }
      setOffers(result.data)
      setRewardId((current) =>
        result.data.rewards.some((item) => item.id === current)
          ? current
          : (result.data.rewards[0]?.id ?? "")
      )
    })

    return () => {
      cancelled = true
    }
  }, [code])

  async function send() {
    setError("")
    setPending(true)
    const result = await postJson<DirectoryRedeem>("/api/v1/redeems", {
      shopCode,
      bons: selected,
      rewardId,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setShopCode("")
    setBons(1)
    setRewardId("")
    setOffers(null)
    router.refresh()
  }

  const pointsToNextBon = Math.max(0, quote.pointsPerBon - quote.availablePoints)
  const bonPhrase =
    quote.bonsAvailable === 1 ? "1 bon disponible" : `${quote.bonsAvailable} bons disponibles`

  return (
    <div className="flex flex-col gap-8 pb-2 lg:gap-10">
      <CitizenPageHeader
        title="Échanger"
        description={`1 bon = ${quote.pointsPerBon} points (${formatUsd(quote.bonUsdValue)}). Au shop, saisissez le code, choisissez l’offre, puis le responsable confirme.`}
      />

      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <CitizenSection
          eyebrow="Préparation"
          title="Préparer l’échange"
          description="Trois étapes. Le responsable du shop confirme ensuite la remise."
        >
          <ol className="space-y-0">
            <li className="pb-6">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                1 · Combien de bons
              </p>
              {maxBons < 1 ? (
                <p className="mt-2 text-sm text-zinc-500">
                  {`Encore ${pointsToNextBon} ${pointsToNextBon === 1 ? "point" : "points"} pour atteindre 1 bon.`}
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="size-11"
                    disabled={selected <= 1}
                    aria-label="Retirer un bon"
                    onClick={() => setBons(Math.max(1, selected - 1))}
                  >
                    <MinusIcon className="size-4" />
                  </Button>
                  <span className="min-w-8 text-center text-2xl font-semibold tabular-nums">
                    {selected}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="size-11"
                    disabled={selected >= maxBons}
                    aria-label="Ajouter un bon"
                    onClick={() => setBons(Math.min(maxBons, selected + 1))}
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                  <span className="text-sm text-zinc-500">
                    {`${pointsToSpend} points`}
                  </span>
                </div>
              )}
            </li>
            <li className="border-t border-zinc-100 py-6">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                2 · Code du shop
              </p>
              <Input
                value={shopCode}
                onChange={(event) => setShopCode(event.target.value.toUpperCase())}
                placeholder="Ex. K7M-2PQ"
                aria-label="Code du shop"
                className="mt-3 h-12 font-mono text-base tracking-wider"
              />
              {offersError ? (
                <p className="mt-2 text-sm text-red-700">{offersError}</p>
              ) : null}
              {code.length > 0 && code.length < 6 ? (
                <p className="mt-2 text-sm text-zinc-500">
                  Le code compte au moins 6 caractères.
                </p>
              ) : null}
            </li>
            <li className="border-t border-zinc-100 pt-6">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                3 · L’offre
              </p>
              {!offers ? (
                <p className="mt-2 text-sm text-zinc-500">
                  Les offres du partenaire apparaissent dès que le code est reconnu.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-zinc-600">
                    {offers.shopName} · {offers.partnerName} · {rewardKindLabel(offers.rewardKind)}
                  </p>
                  {offers.rewards.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Ce partenaire n’a pas encore d’offre d’échange.
                    </p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {offers.rewards.map((reward) => {
                        const active = rewardId === reward.id
                        return (
                          <li key={reward.id}>
                            <button
                              type="button"
                              onClick={() => setRewardId(reward.id)}
                              className={
                                active
                                  ? "flex w-full items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-left ring-2 ring-emerald-700"
                                  : "flex w-full items-center gap-3 rounded-2xl bg-zinc-50 p-3 text-left ring-1 ring-zinc-200"
                              }
                            >
                              {reward.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={reward.image}
                                  alt=""
                                  className="size-14 shrink-0 rounded-xl bg-white object-cover"
                                />
                              ) : (
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-xs text-zinc-400">
                                  Offre
                                </span>
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-zinc-900">
                                  {reward.label}
                                </span>
                                <span className="mt-0.5 block text-xs text-zinc-500">
                                  {formatUsd(String(reward.usd * Math.max(selected, 1)))}
                                </span>
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )}
            </li>
          </ol>
          <Button
            type="button"
            className="mt-6 h-12 w-full rounded-2xl text-base"
            disabled={pending || !canSend}
            onClick={() => void send()}
          >
            {pending ? "Envoi…" : "Envoyer au shop"}
          </Button>
        </CitizenSection>

        <aside className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm lg:sticky lg:top-0">
          <p className="text-xs font-medium tracking-wide uppercase text-primary-foreground/75">
            Solde
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {`${quote.points} pts`}
          </p>
          <p className="mt-2 text-sm text-primary-foreground/80">{bonPhrase}</p>
          {quote.pendingPoints > 0 ? (
            <p className="mt-3 text-sm text-primary-foreground/80">
              {`${quote.pendingPoints} points déjà réservés par un échange en attente.`}
            </p>
          ) : null}
        </aside>
      </div>

      {history.length > 0 ? (
        <CitizenSection
          eyebrow="Historique"
          title="Échanges passés"
          description="Ce que les shops ont confirmé ou refusé."
        >
          <ul className="mt-2 divide-y divide-zinc-100">
            {historyPage.rows.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{item.rewardLabel}</p>
                  <p className="mt-0.5 text-zinc-500">
                    {`${item.shopName} · ${displayShopCode(item.shopCode)}`}
                  </p>
                  <p className="mt-0.5 text-zinc-500">
                    {`${formatDateTimeKinshasa(new Date(item.confirmedAt ?? item.rejectedAt ?? item.sentAt))} · ${item.bons === 1 ? "1 bon" : `${item.bons} bons`} · ${item.points} pts · ${formatUsd(item.usdValue)}`}
                  </p>
                </div>
                <Badge variant={item.status === "CONFIRMED" ? "default" : "secondary"}>
                  {statusLabel(item.status)}
                </Badge>
              </li>
            ))}
          </ul>
          <DirectoryPagination
            page={historyPage.page}
            pageCount={historyPage.pageCount}
            total={historyPage.total}
            from={historyPage.from}
            to={historyPage.to}
            emptyLabel="0 échange"
            onPage={historyPage.setPage}
          />
        </CitizenSection>
      ) : (
        <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500 ring-1 ring-zinc-200/80">
          Aucun échange pour l’instant. Le premier se prépare ici, puis se confirme en shop.
        </p>
      )}
    </div>
  )
}

function statusLabel(status: DirectoryRedeem["status"]) {
  if (status === "SENT") return "En attente au shop"
  if (status === "CONFIRMED") return "Confirmé"
  return "Refusé"
}
