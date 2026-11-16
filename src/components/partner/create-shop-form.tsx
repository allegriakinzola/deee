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
  code: string
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
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6">
      <section className="space-y-3">
        <FormIntro
          title="Le shop"
          description="Le nom que les citoyens voient, et l’une des 24 communes."
        />
        <Field label="Nom" htmlFor="shop-name" hint="Exemple : Vodacom Gombe.">
          <Input
            id="shop-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Vodacom Gombe"
            autoComplete="organization"
            required
          />
        </Field>
        <Field label="Commune" htmlFor="shop-area">
          <CommuneSelect id="shop-area" value={area} onChange={setArea} required />
        </Field>
      </section>

      <section className="space-y-3">
        <FormIntro
          title="Sur la carte"
          description="La position du comptoir. À Kinshasa, la latitude est proche de -4,3 et la longitude de 15,3."
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" htmlFor="shop-lat">
            <Input
              id="shop-lat"
              inputMode="decimal"
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              placeholder="-4,305"
              required
            />
          </Field>
          <Field label="Longitude" htmlFor="shop-lng">
            <Input
              id="shop-lng"
              inputMode="decimal"
              value={lng}
              onChange={(event) => setLng(event.target.value)}
              placeholder="15,313"
              required
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
        <FormIntro
          title="Compte du shop"
          description="Facultatif. Un seul login. S’il est renseigné, la personne reçoit un lien pour choisir son mot de passe. Sinon, vous l’inviterez plus tard."
        />
        <Field label="Son nom" htmlFor="shop-operator-name">
          <Input
            id="shop-operator-name"
            value={operatorName}
            onChange={(event) => setOperatorName(event.target.value)}
            placeholder="Jean Mbala"
            autoComplete="name"
          />
        </Field>
        <Field label="Son e-mail" htmlFor="shop-operator-email">
          <Input
            id="shop-operator-email"
            type="email"
            value={operatorEmail}
            onChange={(event) => setOperatorEmail(event.target.value)}
            placeholder="gombe@exemple.com"
            autoComplete="email"
          />
        </Field>
      </section>

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

function FormIntro({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  )
}
