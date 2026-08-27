"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ClockIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  StoreIcon,
  UserMinusIcon,
} from "lucide-react"

import { deleteJson, patchJson, postJson } from "@/lib/api"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import {
  CreateShopForm,
  type ShopCreated,
} from "@/components/partner/create-shop-form"
import { EditShopForm } from "@/components/partner/edit-shop-form"
import { InviteShopStaffForm } from "@/components/partner/invite-shop-staff-form"
import {
  filterShops,
  operatorLabel,
  summarizeShops,
  type ShopsViewFilter,
} from "@/components/shops/shop-copy"
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
import type { DirectoryShop, ShopInvitationResult } from "@/modules/shops"

type PendingAction = "status" | "delete" | "invite" | null

export function PartnerShopsWorkspace({ shops }: { shops: DirectoryShop[] }) {
  const router = useRouter()
  const stats = useMemo(() => summarizeShops(shops), [shops])
  const [filter, setFilter] = useState<ShopsViewFilter>("all")
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [created, setCreated] = useState<ShopCreated | null>(null)
  const [editTarget, setEditTarget] = useState<DirectoryShop | null>(null)
  const [inviteTarget, setInviteTarget] = useState<DirectoryShop | null>(null)
  const [invited, setInvited] = useState<ShopInvitationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DirectoryShop | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [error, setError] = useState("")

  const visible = useMemo(
    () => filterShops(shops, filter, query),
    [shops, filter, query]
  )

  function selectFilter(next: ShopsViewFilter) {
    setFilter((current) => (current === next && next !== "all" ? "all" : next))
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function setStatus(shop: DirectoryShop, status: "ACTIVE" | "DISABLED") {
    setError("")
    setPendingId(shop.id)
    setPendingAction("status")
    const result = await patchJson(`/api/v1/shops/${shop.id}/status`, {
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

  async function resendInvite(shop: DirectoryShop) {
    if (!shop.operator?.email) {
      setError("Ce shop n’a pas encore d’e-mail.")
      return
    }
    setError("")
    setPendingId(shop.id)
    setPendingAction("invite")
    const result = await postJson<ShopInvitationResult>(
      `/api/v1/shops/${shop.id}/invitations`,
      {
        displayName: shop.operator.displayName,
        email: shop.operator.email,
      }
    )
    setPendingId(null)
    setPendingAction(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setInvited(result.data)
    setInviteTarget(shop)
    router.refresh()
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }
    setError("")
    setPendingId(deleteTarget.id)
    setPendingAction("delete")
    const result = await deleteJson(`/api/v1/shops/${deleteTarget.id}`)
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
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Shops</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Points de dépôt de votre entreprise. Un shop, un compte.
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
          Créer un shop
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Total"
          value={stats.total}
          icon={StoreIcon}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          label="Compte en attente"
          value={stats.pending}
          icon={ClockIcon}
          active={filter === "pending"}
          onClick={() => selectFilter("pending")}
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
            <h2 className="font-medium">Points de dépôt</h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} shop{visible.length === 1 ? "" : "s"} affiché
              {visible.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un shop ou une commune"
              className="h-10 pl-10"
              aria-label="Rechercher un shop"
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
                <th className="px-4 py-3 font-medium whitespace-nowrap">Shop</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Commune
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Compte
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
                    Aucun shop ne correspond à cette vue.
                  </td>
                </tr>
              ) : (
                visible.map((shop) => {
                  const busy = pendingId === shop.id
                  return (
                    <tr
                      key={shop.id}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {shop.lat.toFixed(4)}, {shop.lng.toFixed(4)}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {shop.area}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p>{operatorLabel(shop)}</p>
                        {shop.operator && shop.operator.access !== "READY" ? (
                          <Badge variant="secondary" className="mt-1">
                            Invitation en attente
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {shop.status === "ACTIVE" ? "Actif" : "Désactivé"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ShopRowMenu
                          shop={shop}
                          busy={busy}
                          inviting={pendingAction === "invite" && busy}
                          onEdit={() => setEditTarget(shop)}
                          onInvite={() => {
                            if (shop.operator?.email) {
                              void resendInvite(shop)
                              return
                            }
                            setInvited(null)
                            setInviteTarget(shop)
                          }}
                          onSetStatus={setStatus}
                          onDelete={() => setDeleteTarget(shop)}
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
          if (!open) setCreated(null)
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md" showCloseButton>
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>{created ? "Shop créé" : "Créer un shop"}</SheetTitle>
            <SheetDescription>
              {created
                ? created.invitation
                  ? created.invitation.emailed
                    ? "Le compte du shop a reçu un e-mail d’activation."
                    : "L’e-mail n’a pas pu partir. Copiez le lien."
                  : "Le shop est enregistré. Créez le compte quand vous serez prêt."
                : "Nom, commune, position. Un seul login, facultatif à la création."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            {created ? (
              <InviteResult
                title={created.name}
                invitation={created.invitation}
                copied={copied}
                onCopy={copyText}
                onReset={() => setCreated(null)}
                resetLabel="Créer un autre shop"
              />
            ) : (
              <CreateShopForm onCreated={setCreated} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md" showCloseButton>
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>Modifier · {editTarget?.name ?? ""}</SheetTitle>
            <SheetDescription>
              Le compte du shop ne change pas ici.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            {editTarget ? (
              <EditShopForm
                key={editTarget.id}
                shop={editTarget}
                onSaved={() => setEditTarget(null)}
              />
            ) : null}
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
        <SheetContent side="right" className="w-full sm:max-w-md" showCloseButton>
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>
              {invited ? "Invitation envoyée" : `Compte · ${inviteTarget?.name ?? ""}`}
            </SheetTitle>
            <SheetDescription>
              Un seul login par boutique. Le responsable ne gère pas d’autres
              utilisateurs.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            {invited ? (
              <InviteResult
                title={inviteTarget?.name ?? ""}
                invitation={invited}
                copied={copied}
                onCopy={copyText}
                onReset={() => {
                  setInvited(null)
                  setInviteTarget(null)
                }}
                resetLabel="Fermer"
              />
            ) : inviteTarget ? (
              <InviteShopStaffForm
                shopId={inviteTarget.id}
                onCreated={setInvited}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce shop ?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${deleteTarget.name} et son compte seront retirés.`
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

function ShopRowMenu({
  shop,
  busy,
  inviting,
  onEdit,
  onInvite,
  onSetStatus,
  onDelete,
}: {
  shop: DirectoryShop
  busy: boolean
  inviting: boolean
  onEdit: () => void
  onInvite: () => void
  onSetStatus: (shop: DirectoryShop, status: "ACTIVE" | "DISABLED") => void
  onDelete: () => void
}) {
  const hasReadyLogin = shop.operator?.access === "READY"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={busy}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions pour ${shop.name}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}>Modifier</DropdownMenuItem>
        {!hasReadyLogin ? (
          <DropdownMenuItem onClick={onInvite}>
            {shop.operator
              ? inviting
                ? "Envoi…"
                : "Renvoyer le compte"
              : "Créer le compte"}
          </DropdownMenuItem>
        ) : null}
        {shop.status === "ACTIVE" ? (
          <DropdownMenuItem onClick={() => onSetStatus(shop, "DISABLED")}>
            Désactiver
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onSetStatus(shop, "ACTIVE")}>
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

function InviteResult({
  title,
  invitation,
  copied,
  onCopy,
  onReset,
  resetLabel,
}: {
  title: string
  invitation: ShopInvitationResult | null
  copied: boolean
  onCopy: (value: string) => void
  onReset: () => void
  resetLabel: string
}) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm">
        <span className="font-medium">{title}</span> est enregistré.
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
          Aucun compte n’a encore été créé pour ce shop.
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
