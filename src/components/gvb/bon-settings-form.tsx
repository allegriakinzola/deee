"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { patchJson } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input, Label } from "@/components/ui/input"
import type { OperatorSettings } from "@/modules/settings"

function displayAmount(value: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return value
  }
  return String(amount)
}

export function BonSettingsForm({
  settings,
}: {
  settings: OperatorSettings
}) {
  const router = useRouter()
  const [bonUsdValue, setBonUsdValue] = useState(
    displayAmount(settings.bonUsdValue)
  )
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const current = displayAmount(settings.bonUsdValue)
  const dirty = bonUsdValue.trim() !== current
  const preview = Number(bonUsdValue.replace(",", "."))
  const previewLabel = Number.isFinite(preview) && preview > 0
    ? `1 bon = ${displayAmount(String(preview))} USD.`
    : "Indiquez un montant en USD."

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
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
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="rounded-2xl py-0">
        <CardHeader className="border-b border-border/80 py-5">
          <CardTitle>Valeur d’un bon</CardTitle>
          <CardDescription>
            Un bon est le ticket minimum avant d’échanger des points en shop.
            Sa valeur en USD fixe le nombre de points requis (1 bon = 10 USD
            par défaut).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="bon-usd">Montant</Label>
            <div className="relative max-w-xs">
              <Input
                id="bon-usd"
                name="bonUsdValue"
                inputMode="decimal"
                value={bonUsdValue}
                onChange={(event) => setBonUsdValue(event.target.value)}
                className="pr-14"
                aria-describedby="bon-usd-hint"
              />
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
                USD
              </span>
            </div>
            <p id="bon-usd-hint" className="text-xs text-muted-foreground">
              {previewLabel} 10 USD constituent un bon par défaut.
            </p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="justify-end gap-3 py-4">
          <Button
            type="submit"
            disabled={pending || !dirty}
            className="h-10 rounded-2xl px-4"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
