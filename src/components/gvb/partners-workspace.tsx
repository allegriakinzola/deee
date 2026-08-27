"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2Icon,
  CopyIcon,
  LandmarkIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  ShoppingBagIcon,
  StoreIcon,
  UserMinusIcon,
} from "lucide-react"

import { deleteJson, patchJson } from "@/lib/api"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import {
  CreatePartnerForm,
  type PartnerCreated,
} from "@/components/gvb/create-partner-form"
import { InvitePartnerAdminForm } from "@/components/gvb/invite-partner-admin-form"
import { SetPartnerLogoForm } from "@/components/gvb/set-partner-logo-form"
import {
  KIND_LABELS,
  adminSummary,
  filterDirectoryPartners,
  initials,
  summarizePartners,
  type PartnersViewFilter,
} from "@/components/gvb/partner-copy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  DirectoryPartner,
  PartnerInvitationResult,
} from "@/modules/partners"

type PendingAction = "status" | "delete" | null

export function PartnersWorkspace({
  partners,
}: {
  partners: DirectoryPartner[]
}) {
  const router = useRouter()
  const stats = useMemo(() => summarizePartners(partners), [partners])
  const [filter, setFilter] = useState<PartnersViewFilter>("all")
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [created, setCreated] = useState<PartnerCreated | null>(null)
  const [inviteTarget, setInviteTarget] = useState<DirectoryPartner | null>(
    null
  )
  const [invited, setInvited] = useState<PartnerInvitationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DirectoryPartner | null>(
    null
  )
  const [logoTarget, setLogoTarget] = useState<DirectoryPartner | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [error, setError] = useState("")

  const visible = useMemo(
    () => filterDirectoryPartners(partners, filter, query),
    [partners, filter, query]
  )

  function selectFilter(next: PartnersViewFilter) {
    setFilter((current) => (current === next && next !== "all" ? "all" : next))
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function setStatus(
    partner: DirectoryPartner,
    status: "ACTIVE" | "DISABLED"
  ) {
    setError("")
    setPendingId(partner.id)
    setPendingAction("status")
    const result = await patchJson(`/api/v1/partners/${partner.id}/status`, {
      status,
    })
    setPendingId(null)
    setPendingAction(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.refresh()
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }
    setError("")
    setPendingId(deleteTarget.id)
    setPendingAction("delete")
    const result = await deleteJson(`/api/v1/partners/${deleteTarget.id}`)
    setPendingId(null)
    setPendingAction(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
            Réseau
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Partenaires
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Entreprises où les citoyens déposent leurs appareils et échangent
            leurs points.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 rounded-2xl px-4"
          onClick={() => {
            setCreated(null)
            setCreateOpen(true)
          }}
        >
          <PlusIcon className="size-4" />
          Créer un partenaire
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Total"
          value={stats.total}
          icon={StoreIcon}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          label="Télécom"
          value={stats.telecom}
          icon={Building2Icon}
          active={filter === "telecom"}
          onClick={() => selectFilter("telecom")}
        />
        <StatCard
          label="Banques"
          value={stats.bank}
          icon={LandmarkIcon}
          active={filter === "bank"}
          onClick={() => selectFilter("bank")}
        />
        <StatCard
          label="Produits"
          value={stats.products}
          icon={ShoppingBagIcon}
          active={filter === "products"}
          onClick={() => selectFilter("products")}
        />
        <StatCard
          label="Désactivés"
          value={stats.disabled}
          icon={UserMinusIcon}
          active={filter === "disabled"}
          onClick={() => selectFilter("disabled")}
        />
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">Entreprises</h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} partenaire{visible.length === 1 ? "" : "s"}{" "}
              affiché{visible.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un nom ou un e-mail"
              className="h-10 pl-10"
              aria-label="Rechercher un partenaire"
            />
          </div>
        </div>

        {error ? (
          <p className="border-b border-border/80 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DirectoryTableScroll>
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Entreprise
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Type</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Administrateurs
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Statut
                </th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    Aucun partenaire ne correspond à cette vue.
                  </td>
                </tr>
              ) : (
                visible.map((partner) => {
                  const busy = pendingId === partner.id
                  return (
                    <tr
                      key={partner.id}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {partner.logo ? (
                            // Logos partenaires déjà dans /public
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={partner.logo}
                              alt=""
                              className="size-9 shrink-0 rounded-full bg-white object-contain ring-1 ring-foreground/10"
                            />
                          ) : (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/40 text-xs font-semibold">
                              {initials(partner.shortName) || "?"}
                            </span>
                          )}
                          <div>
                            <p className="font-medium">{partner.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {partner.shortName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {KIND_LABELS[partner.kind]}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p>{adminSummary(partner)}</p>
                        {partner.admins.some(
                          (admin) => admin.access !== "READY"
                        ) ? (
                          <Badge variant="secondary" className="mt-1">
                            Invitation en attente
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {partner.status === "ACTIVE" ? "Actif" : "Désactivé"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PartnerRowMenu
                          partner={partner}
                          busy={busy}
                          onLogo={() => setLogoTarget(partner)}
                          onInvite={() => {
                            setInvited(null)
                            setInviteTarget(partner)
                          }}
                          onSetStatus={setStatus}
                          onDelete={() => setDeleteTarget(partner)}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </DirectoryTableScroll>
      </section>

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setCreated(null)
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>
              {created ? "Partenaire créé" : "Créer un partenaire"}
            </SheetTitle>
            <SheetDescription>
              {created
                ? created.invitation
                  ? created.invitation.emailed
                    ? "Un e-mail d’activation a été envoyé à l’administrateur. Vous pouvez aussi copier le lien."
                    : "L’e-mail n’a pas pu partir. Copiez le lien et transmettez-le à l’administrateur."
                  : "L’entreprise est enregistrée. Invitez un administrateur quand vous serez prêt."
                : "Télécom, banque ou produits. L’administrateur d’entreprise est facultatif à la création."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            {created ? (
              <CreatedInvitePanel
                name={created.name}
                invitation={created.invitation}
                copied={copied}
                onCopy={copyText}
                onReset={() => setCreated(null)}
                resetLabel="Créer un autre partenaire"
              />
            ) : (
              <CreatePartnerForm onCreated={setCreated} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={inviteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInviteTarget(null)
            setInvited(null)
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>
              {invited
                ? "Invitation envoyée"
                : `Inviter · ${inviteTarget?.shortName ?? ""}`}
            </SheetTitle>
            <SheetDescription>
              {invited
                ? invited.emailed
                  ? "Un e-mail d’activation a été envoyé. Vous pouvez aussi copier le lien."
                  : "L’e-mail n’a pas pu partir. Copiez le lien et transmettez-le."
                : "La personne rejoindra l’espace partenaire après avoir choisi son mot de passe."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            {invited ? (
              <CreatedInvitePanel
                name={inviteTarget?.name ?? ""}
                invitation={invited}
                copied={copied}
                onCopy={copyText}
                onReset={() => setInvited(null)}
                resetLabel="Inviter quelqu’un d’autre"
              />
            ) : inviteTarget ? (
              <InvitePartnerAdminForm
                partnerId={inviteTarget.id}
                onCreated={setInvited}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={logoTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLogoTarget(null)
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>Logo · {logoTarget?.shortName ?? ""}</SheetTitle>
            <SheetDescription>
              Ce visuel s’affiche dans l’annuaire des partenaires.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            {logoTarget ? (
              <SetPartnerLogoForm
                partnerId={logoTarget.id}
                currentLogo={logoTarget.logo}
                onSaved={() => setLogoTarget(null)}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce partenaire ?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${deleteTarget.name} sera retiré. Ses administrateurs resteront dans Utilisateurs ; vous pourrez les supprimer là.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pendingAction === "delete"}
              onClick={confirmDelete}
            >
              {pendingAction === "delete" ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PartnerRowMenu({
  partner,
  busy,
  onLogo,
  onInvite,
  onSetStatus,
  onDelete,
}: {
  partner: DirectoryPartner
  busy: boolean
  onLogo: () => void
  onInvite: () => void
  onSetStatus: (
    partner: DirectoryPartner,
    status: "ACTIVE" | "DISABLED"
  ) => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={busy}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions pour ${partner.name}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onLogo}>
          {partner.logo ? "Changer le logo" : "Ajouter un logo"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onInvite}>
          Inviter un administrateur
        </DropdownMenuItem>
        {partner.status === "ACTIVE" ? (
          <DropdownMenuItem onClick={() => onSetStatus(partner, "DISABLED")}>
            Désactiver
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onSetStatus(partner, "ACTIVE")}>
            Réactiver
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreatedInvitePanel({
  name,
  invitation,
  copied,
  onCopy,
  onReset,
  resetLabel,
}: {
  name: string
  invitation: PartnerInvitationResult | null
  copied: boolean
  onCopy: (value: string) => void
  onReset: () => void
  resetLabel: string
}) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm">
        <span className="font-medium">{name}</span> est enregistré.
      </p>
      {invitation ? (
        <>
          <p className="text-sm">
            {invitation.emailed ? "E-mail envoyé à " : "Lien pour "}
            <span className="font-medium">{invitation.email}</span>
          </p>
          <p className="break-all rounded-2xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
            {invitation.invitationUrl}
          </p>
          <Button
            type="button"
            className="h-11 w-full rounded-2xl"
            onClick={() => onCopy(invitation.invitationUrl)}
          >
            <CopyIcon className="size-4" />
            {copied ? "Lien copié" : "Copier le lien"}
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun administrateur n’a encore été invité.
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-2xl"
        onClick={onReset}
      >
        {resetLabel}
      </Button>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  value: number
  icon: typeof StoreIcon
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-2xl bg-card p-4 text-left ring-2 ring-emerald-700/25 transition-colors"
          : "rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] leading-tight font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <Icon className="size-4 text-emerald-800/60" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
    </button>
  )
}
