"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import type { PartnerInvitationResult } from "@/modules/partners"

export function InvitePartnerAdminForm({
  partnerId,
  onCreated,
}: {
  partnerId: string
  onCreated: (result: PartnerInvitationResult) => void
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

    const result = await postJson<PartnerInvitationResult>(
      `/api/v1/partners/${partnerId}/invitations`,
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
      <Field label="Nom" htmlFor="partner-invite-name">
        <Input
          id="partner-invite-name"
          name="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Marie Kabila"
          autoComplete="name"
          required
        />
      </Field>
      <Field label="E-mail" htmlFor="partner-invite-email">
        <Input
          id="partner-invite-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="marie@exemple.com"
          autoComplete="email"
          required
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 w-full rounded-2xl"
      >
        {pending ? "Envoi…" : "Inviter l’administrateur"}
      </Button>
    </form>
  )
}
