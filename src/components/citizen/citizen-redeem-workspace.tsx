"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MinusIcon, PlusIcon } from "lucide-react"

import { getJson, postJson } from "@/lib/api"
import { formatUsd } from "@/lib/money"
import { kindLabel } from "@/lib/redeem-rewards"
import { displayShopCode, normalizeShopCode } from "@/lib/shop-code"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 lg:text-2xl">
          Échanger
        </h1>
        <p className="mt-0.5 text-[13px] text-zinc-500 lg:text-sm">
          Un bon = {quote.pointsPerBon} points (
          {quote.bonUsdValue.replace(".", ",")} USD). Saisissez le code du shop,
          puis choisissez l’objet d’échange.
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-2xl bg-white px-4 py-4 lg:px-5">
        <p className="text-sm font-semibold text-zinc-900">
          Solde · {quote.points} pts
          {quote.pendingPoints > 0
            ? ` · ${quote.pendingPoints} pts en attente`
            : ""}
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          {quote.bonsAvailable} bon{quote.bonsAvailable === 1 ? "" : "s"}{" "}
          <span className="text-base font-medium text-zinc-500">
            disponibles
          </span>
        </p>
        {maxBons < 1 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Encore {Math.max(0, quote.pointsPerBon - quote.availablePoints)}{" "}
            points pour atteindre 1 bon.
          </p>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={selected <= 1}
              aria-label="Retirer un bon"
              onClick={() => setBons(Math.max(1, selected - 1))}
            >
              <MinusIcon className="size-3.5" />
            </Button>
            <span className="min-w-10 text-center text-sm font-medium">
              {selected}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={selected >= maxBons}
              aria-label="Ajouter un bon"
              onClick={() => setBons(Math.min(maxBons, selected + 1))}
            >
              <PlusIcon className="size-3.5" />
            </Button>
            <span className="text-sm text-zinc-500">{pointsToSpend} pts</span>
          </div>
        )}
        <div className="mt-4">
          <Input
            value={shopCode}
            onChange={(event) => setShopCode(event.target.value.toUpperCase())}
            placeholder="Code shop, ex. K7M-2PQ"
            aria-label="Code du shop"
            className="h-11 font-mono tracking-wider"
          />
        </div>
        {offersError ? (
          <p className="mt-3 text-sm text-red-700">{offersError}</p>
        ) : null}
        {offers ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-zinc-900">
              {offers.partnerName} · {kindLabel(offers.partnerKind)}
            </p>
            <p className="text-[13px] text-zinc-500">{offers.shopName}</p>
            <ul className="space-y-2">
              {offers.rewards.map((reward) => (
                <li key={reward.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-zinc-50 px-3 py-3">
                    <input
                      type="radio"
                      name="reward"
                      value={reward.id}
                      checked={rewardId === reward.id}
                      onChange={() => setRewardId(reward.id)}
                      className="size-4 accent-current"
                    />
                    <span className="min-w-0 flex-1 text-sm font-medium text-zinc-900">
                      {reward.label}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {formatUsd(String(reward.usd * Math.max(selected, 1)))}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Button
          type="button"
          className="mt-4 h-11 w-full rounded-2xl sm:w-auto"
          disabled={pending || !canSend}
          onClick={() => void send()}
        >
          {pending ? "Envoi…" : "Envoyer"}
        </Button>
      </section>

      {history.length > 0 ? (
        <section className="rounded-2xl bg-white px-4 py-4">
          <p className="text-sm font-semibold text-zinc-900">Historique</p>
          <ul className="mt-3 space-y-3">
            {history.map((item) => (
              <li key={item.id} className="text-sm">
                <p className="font-medium text-zinc-900">
                  {item.rewardLabel}
                </p>
                <p className="text-zinc-500">
                  {item.shopName} · {displayShopCode(item.shopCode)}
                </p>
                <p className="text-zinc-500">
                  {statusLabel(item.status)} · {item.bons} bon
                  {item.bons === 1 ? "" : "s"} · {item.points} pts ·{" "}
                  {formatUsd(item.usdValue)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function statusLabel(status: DirectoryRedeem["status"]) {
  if (status === "SENT") return "En attente au shop"
  if (status === "CONFIRMED") return "Confirmé"
  return "Refusé"
}
