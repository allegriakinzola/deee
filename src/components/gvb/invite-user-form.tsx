"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postJson } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"

const ROLES = [
  { value: "GVB_ADMIN", label: "Administrateur GVB" },
  { value: "GVB_COLLECTOR", label: "Collecteur" },
] as const

export type InviteCreated = {
  email: string
  invitationUrl: string
  emailed: boolean
}

export function InviteUserForm({
  onCreated,
}: {
  onCreated: (result: InviteCreated) => void
}) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("GVB_ADMIN")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    const result = await postJson<InviteCreated>("/api/v1/users/invitations", {
      displayName,
      email,
      role,
    })

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
      <Field label="Nom" htmlFor="invite-name">
        <Input
          id="invite-name"
          name="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Marie Kabila"
          autoComplete="name"
          required
        />
      </Field>
      <Field label="E-mail" htmlFor="invite-email">
        <Input
          id="invite-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="marie@exemple.com"
          autoComplete="email"
          required
        />
      </Field>
      <Field
        label="Rôle"
        htmlFor="invite-role"
        hint="La personne choisira son mot de passe via le lien d’invitation."
      >
        <select
          id="invite-role"
          name="role"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as (typeof ROLES)[number]["value"])
          }
          className="h-12 w-full rounded-2xl border border-transparent bg-muted/70 px-4 text-sm outline-none hover:bg-muted focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {ROLES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 w-full rounded-2xl"
      >
        {pending ? "Création…" : "Créer l’utilisateur"}
      </Button>
    </form>
  )
}
