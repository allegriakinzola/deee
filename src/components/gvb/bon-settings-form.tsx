"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { patchJson } from "@/lib/api"
import { formatUsd } from "@/lib/money"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import {
  DEFAULT_USD_PER_POINT,
  pointsPerBon,
} from "@/modules/catalog/conversion"
import type { OperatorSettings } from "@/modules/settings"

function displayAmount(value: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return value
  }
  return String(amount)
}

function parseAmount(value: string) {
  const amount = Number(value.trim().replace(",", "."))
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function BonSettingsForm({
  settings,
}: {
  settings: OperatorSettings
}) {
  const router = useRouter()
  const saved = displayAmount(settings.bonUsdValue)
  const [bonUsdValue, setBonUsdValue] = useState(saved)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)

  const dirty = bonUsdValue.trim() !== saved
  const amount = parseAmount(bonUsdValue)
  const points = amount
    ? pointsPerBon(DEFAULT_USD_PER_POINT, String(amount))
    : 0
  const updated = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Kinshasa",
  }).format(new Date(settings.updatedAt))

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSavedNotice(false)
    setPending(true)
    const result = await patchJson<OperatorSettings>("/api/v1/settings", {
      bonUsdValue,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setBonUsdValue(displayAmount(result.data.bonUsdValue))
    setSavedNotice(true)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <div className="border-b border-border/80 px-5 py-5">
        <h2 className="text-base font-semibold">Échanges</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Un bon est le minimum pour échanger des points en shop. Les échanges
          déjà envoyés gardent la valeur qu’ils avaient à ce moment-là.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <Label htmlFor="bon-usd">Valeur d’un bon</Label>
          <p id="bon-usd-hint" className="mt-1 text-sm text-muted-foreground">
            Montant en dollars. La valeur de départ est 10 USD.
          </p>
        </div>
        <div className="relative w-full sm:w-44">
          <Input
            id="bon-usd"
            name="bonUsdValue"
            inputMode="decimal"
            value={bonUsdValue}
            onChange={(event) => {
              setBonUsdValue(event.target.value)
              setSavedNotice(false)
            }}
            className="pr-14"
            aria-describedby="bon-usd-hint"
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
            USD
          </span>
        </div>
      </div>

      <dl className="grid border-t border-border/80 sm:grid-cols-3">
        <Fact
          label="1 bon"
          value={amount ? formatUsd(amount.toFixed(2)) : "—"}
        />
        <Fact
          label="Points à réunir"
          value={points >= 1 ? String(points) : "—"}
        />
        <Fact
          label="Valeur d’un point"
          value={formatUsd(DEFAULT_USD_PER_POINT)}
        />
      </dl>
      <p className="border-t border-border/80 px-5 py-3 text-xs text-muted-foreground">
        {points >= 1
          ? "Le barème des matériels ne change pas. Seul le nombre de points d’un bon suit ce montant."
          : "Indiquez un montant d’au moins 1 USD."}
      </p>

      {error ? (
        <p className="border-t border-border/80 px-5 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {savedNotice ? "Enregistré." : `Dernière modification : ${updated}`}
        </p>
        <div className="flex gap-2">
          {dirty ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-2xl px-4"
              onClick={() => {
                setBonUsdValue(saved)
                setError("")
                setSavedNotice(false)
              }}
            >
              Annuler
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={pending || !dirty || points < 1}
            className="h-10 rounded-2xl px-4"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/80 px-5 py-4 sm:border-l sm:first:border-l-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
