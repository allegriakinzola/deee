"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postForm } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import { PartnerLogoField } from "@/components/gvb/partner-logo-field"
import { cn } from "@/lib/utils"
import {
  REWARD_KINDS,
  defaultOfferLabels,
  defaultRewardKind,
  rewardKindExamples,
  rewardKindLabel,
  type PartnerSector,
  type RewardKind,
} from "@/lib/reward-offers"
import type { PartnerInvitationResult } from "@/modules/partners"

const SECTORS = [
  {
    value: "TELECOM",
    label: "Télécom",
    detail: "Opérateur mobile",
  },
  {
    value: "BANK",
    label: "Banque",
    detail: "Banque ou microfinance",
  },
  {
    value: "PRODUCTS",
    label: "Produits",
    detail: "Biens et goodies",
  },
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
  const [kind, setKind] = useState<PartnerSector>("TELECOM")
  const [rewardKind, setRewardKind] = useState<RewardKind>("FORFAIT")
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
    body.append("rewardKind", rewardKind)
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

  function chooseSector(next: PartnerSector) {
    setKind(next)
    setRewardKind(defaultRewardKind(next))
  }

  const offers = defaultOfferLabels(rewardKind)

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6">
      <section className="space-y-3">
        <FormIntro
          title="L’entreprise"
          description="Le nom officiel, puis le nom court affiché sur les cartes."
        />
        <Field
          label="Nom"
          htmlFor="partner-name"
          hint="Exemple : Vodacom RDC."
        >
          <Input
            id="partner-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Vodacom RDC"
            required
          />
        </Field>
        <Field
          label="Nom court"
          htmlFor="partner-short"
          hint="Exemple : Vodacom. C’est ce nom qui apparaît sur les boutons."
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
        <PartnerLogoField
          id="partner-logo"
          file={logo}
          hint="JPEG, PNG ou WebP · 2 Mo maximum."
          onChange={setLogo}
        />
      </section>

      <section className="space-y-3">
        <FormIntro
          title="Ce que les shops remettent"
          description="Choisissez le secteur. La récompense se règle toute seule, et vous pouvez la changer."
        />
        <div className="space-y-2">
          <p className="text-sm font-medium" id="partner-sector-label">
            Secteur
          </p>
          <div
            role="group"
            aria-labelledby="partner-sector-label"
            className="grid grid-cols-3 gap-2"
          >
            {SECTORS.map((item) => (
              <Choice
                key={item.value}
                pressed={kind === item.value}
                title={item.label}
                detail={item.detail}
                onClick={() => chooseSector(item.value)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium" id="partner-reward-label">
            Récompense
          </p>
          <div
            role="group"
            aria-labelledby="partner-reward-label"
            className="space-y-2"
          >
            {REWARD_KINDS.map((item) => (
              <Choice
                key={item}
                pressed={rewardKind === item}
                title={rewardKindLabel(item)}
                detail={rewardKindExamples(item)}
                onClick={() => setRewardKind(item)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Offres créées : {offers.join(", ")}.
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
        <FormIntro
          title="Administrateur"
          description="Facultatif. S’il est renseigné, il reçoit un lien pour choisir son mot de passe. Sinon, vous l’inviterez plus tard."
        />
        <Field label="Son nom" htmlFor="partner-admin-name">
          <Input
            id="partner-admin-name"
            name="adminDisplayName"
            value={adminName}
            onChange={(event) => setAdminName(event.target.value)}
            placeholder="Marie Kabila"
            autoComplete="name"
          />
        </Field>
        <Field label="Son e-mail" htmlFor="partner-admin-email">
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
      </section>

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
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function Choice({
  pressed,
  title,
  detail,
  onClick,
}: {
  pressed: boolean
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border px-3 py-3 text-left transition-colors",
        pressed
          ? "border-primary bg-primary/10"
          : "border-border bg-background hover:bg-muted/60"
      )}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
        {detail}
      </span>
    </button>
  )
}
