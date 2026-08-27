"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import type { ShopInvitationResult } from "@/modules/shops"

export function InviteShopStaffForm({
  shopId,
  onCreated,
}: {
  shopId: string
  onCreated: (result: ShopInvitationResult) => void
}) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    const result = await postJson<ShopInvitationResult>(
      `/api/v1/shops/${shopId}/invitations`,
      { displayName, email }
    )
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setDisplayName("")
    setEmail("")
    router.refresh()
    onCreated(result.data)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <Field label="Nom" htmlFor="shop-staff-name">
        <Input
          id="shop-staff-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Jean Mbala"
          required
        />
      </Field>
      <Field
        label="E-mail"
        htmlFor="shop-staff-email"
        hint="Un seul compte par boutique."
      >
        <Input
          id="shop-staff-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="gombe@exemple.com"
          required
        />
      </Field>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 w-full rounded-2xl"
      >
        {pending ? "Envoi…" : "Créer le compte du shop"}
      </Button>
    </form>
  )
}
