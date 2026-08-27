"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { patchJson } from "@/lib/api"
import { CommuneSelect } from "@/components/shops/commune-select"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import type { DirectoryShop } from "@/modules/shops"

export function EditShopForm({
  shop,
  onSaved,
}: {
  shop: DirectoryShop
  onSaved: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState(shop.name)
  const [area, setArea] = useState(shop.area)
  const [lat, setLat] = useState(String(shop.lat))
  const [lng, setLng] = useState(String(shop.lng))
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    const result = await patchJson(`/api/v1/shops/${shop.id}`, {
      name,
      area,
      lat,
      lng,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.refresh()
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <Field label="Nom du shop" htmlFor="edit-shop-name">
        <Input
          id="edit-shop-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </Field>
      <Field
        label="Commune"
        htmlFor="edit-shop-area"
        hint="Les 24 communes de Kinshasa."
      >
        <CommuneSelect
          id="edit-shop-area"
          value={area}
          onChange={setArea}
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude" htmlFor="edit-shop-lat">
          <Input
            id="edit-shop-lat"
            inputMode="decimal"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            required
          />
        </Field>
        <Field label="Longitude" htmlFor="edit-shop-lng">
          <Input
            id="edit-shop-lng"
            inputMode="decimal"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            required
          />
        </Field>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 w-full rounded-2xl"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  )
}
