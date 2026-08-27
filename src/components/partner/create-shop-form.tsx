"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postJson } from "@/lib/api"
import { CommuneSelect } from "@/components/shops/commune-select"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import type { ShopInvitationResult } from "@/modules/shops"

export type ShopCreated = {
  id: string
  name: string
  invitation: ShopInvitationResult | null
}

export function CreateShopForm({
  onCreated,
}: {
  onCreated: (result: ShopCreated) => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [area, setArea] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [operatorName, setOperatorName] = useState("")
  const [operatorEmail, setOperatorEmail] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    const hasOperator =
      operatorName.trim().length > 0 || operatorEmail.trim().length > 0
    const result = await postJson<ShopCreated>("/api/v1/shops", {
      name,
      area,
      lat,
      lng,
      operator: hasOperator
        ? { displayName: operatorName, email: operatorEmail }
        : undefined,
    })

    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }

    setName("")
    setArea("")
    setLat("")
    setLng("")
    setOperatorName("")
    setOperatorEmail("")
    router.refresh()
    onCreated(result.data)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <Field label="Nom du shop" htmlFor="shop-name">
        <Input
          id="shop-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Vodacom Gombe"
          required
        />
      </Field>
      <Field
        label="Commune"
        htmlFor="shop-area"
        hint="Les 24 communes de Kinshasa."
      >
        <CommuneSelect
          id="shop-area"
          value={area}
          onChange={setArea}
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude" htmlFor="shop-lat">
          <Input
            id="shop-lat"
            inputMode="decimal"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            placeholder="-4.305"
            required
          />
        </Field>
        <Field label="Longitude" htmlFor="shop-lng">
          <Input
            id="shop-lng"
            inputMode="decimal"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            placeholder="15.313"
            required
          />
        </Field>
      </div>

      <div className="rounded-2xl bg-muted/40 p-4">
        <p className="text-sm font-medium">Compte du shop (facultatif)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Un seul login par boutique. La personne choisira son mot de passe via
          le lien d’invitation. Vous pourrez aussi l’inviter plus tard.
        </p>
        <div className="mt-3 space-y-3">
          <Field label="Nom" htmlFor="shop-operator-name">
            <Input
              id="shop-operator-name"
              value={operatorName}
              onChange={(event) => setOperatorName(event.target.value)}
              placeholder="Jean Mbala"
            />
          </Field>
          <Field label="E-mail" htmlFor="shop-operator-email">
            <Input
              id="shop-operator-email"
              type="email"
              value={operatorEmail}
              onChange={(event) => setOperatorEmail(event.target.value)}
              placeholder="gombe@exemple.com"
            />
          </Field>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 w-full rounded-2xl"
      >
        {pending ? "Création…" : "Créer le shop"}
      </Button>
    </form>
  )
}
