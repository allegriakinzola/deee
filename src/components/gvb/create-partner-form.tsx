"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postForm } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { PartnerLogoField } from "@/components/gvb/partner-logo-field"
import type { PartnerInvitationResult } from "@/modules/partners"

const KINDS = [
  { value: "TELECOM", label: "Télécom — crédit ou mégas" },
  { value: "BANK", label: "Banque — services ou argent" },
  { value: "PRODUCTS", label: "Produits — articles en shop" },
] as const

export type PartnerCreated = {
  id: string
  name: string
  invitation: PartnerInvitationResult | null
}

export function CreatePartnerForm({
  onCreated,
}: {
  onCreated: (result: PartnerCreated) => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [shortName, setShortName] = useState("")
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("TELECOM")
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    const body = new FormData()
    body.append("name", name)
    body.append("shortName", shortName)
    body.append("kind", kind)
    if (adminName.trim().length > 0 || adminEmail.trim().length > 0) {
      body.append("adminDisplayName", adminName)
      body.append("adminEmail", adminEmail)
    }
    if (logo) {
      body.append("logo", logo)
    }

    const result = await postForm<PartnerCreated>("/api/v1/partners", body)

    setPending(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setName("")
    setShortName("")
    setAdminName("")
    setAdminEmail("")
    setLogo(null)
    router.refresh()
    onCreated(result.data)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <Field label="Nom" htmlFor="partner-name">
        <Input
          id="partner-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Vodacom"
          required
        />
      </Field>
      <Field
        label="Nom court"
        htmlFor="partner-short"
        hint="Affiché sur les boutons et les cartes."
      >
        <Input
          id="partner-short"
          name="shortName"
          value={shortName}
          onChange={(event) => setShortName(event.target.value)}
          placeholder="Vodacom"
          required
        />
      </Field>
      <Field
        label="Type"
        htmlFor="partner-kind"
        hint="Détermine le type de récompense en shop."
      >
        <select
          id="partner-kind"
          name="kind"
          value={kind}
          onChange={(event) =>
            setKind(event.target.value as (typeof KINDS)[number]["value"])
          }
          className="h-12 w-full rounded-2xl border border-transparent bg-muted/70 px-4 text-sm outline-none hover:bg-muted focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {KINDS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>

      <PartnerLogoField
        id="partner-logo"
        file={logo}
        hint="JPEG, PNG ou WebP · 2 Mo maximum. Facultatif."
        onChange={setLogo}
      />

      <div className="rounded-2xl bg-muted/40 p-4">
        <p className="text-sm font-medium">Administrateur (facultatif)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          La personne définira son mot de passe via le lien d’invitation. Vous
          pourrez aussi l’inviter plus tard.
        </p>
        <div className="mt-3 space-y-3">
          <Field label="Nom" htmlFor="partner-admin-name">
            <Input
              id="partner-admin-name"
              name="adminDisplayName"
              value={adminName}
              onChange={(event) => setAdminName(event.target.value)}
              placeholder="Marie Kabila"
              autoComplete="name"
            />
          </Field>
          <Field label="E-mail" htmlFor="partner-admin-email">
            <Input
              id="partner-admin-email"
              name="adminEmail"
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="marie@exemple.com"
              autoComplete="email"
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
        {pending ? "Création…" : "Créer le partenaire"}
      </Button>
    </form>
  )
}
