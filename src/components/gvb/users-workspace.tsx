"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ClockIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  UserMinusIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react"

import { deleteJson, patchJson, postJson } from "@/lib/api"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import { InviteUserForm, type InviteCreated } from "@/components/gvb/invite-user-form"
import {
  ACCESS_LABELS,
  ROLE_LABELS,
  filterDirectoryUsers,
  initials,
  summarizeDirectory,
  type UsersViewFilter,
} from "@/components/gvb/user-copy"
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
import type { DirectoryUser } from "@/modules/users"

type PendingAction = "status" | "delete" | "invite" | null

export function UsersWorkspace({
  actorId,
  users,
}: {
  actorId: string
  users: DirectoryUser[]
}) {
  const router = useRouter()
  const stats = useMemo(() => summarizeDirectory(users), [users])
  const [filter, setFilter] = useState<UsersViewFilter>("all")
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [created, setCreated] = useState<InviteCreated | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DirectoryUser | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [error, setError] = useState("")

  const visible = useMemo(
    () => filterDirectoryUsers(users, filter, query),
    [users, filter, query]
  )

  function selectFilter(next: UsersViewFilter) {
    setFilter((current) => (current === next && next !== "all" ? "all" : next))
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function setStatus(user: DirectoryUser, status: "ACTIVE" | "DISABLED") {
    setError("")
    setPendingId(user.id)
    setPendingAction("status")
    const result = await patchJson(`/api/v1/users/${user.id}/status`, { status })
    setPendingId(null)
    setPendingAction(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.refresh()
  }

  async function resendInvite(user: DirectoryUser) {
    if (!user.email) {
      setError("Cet utilisateur n’a pas d’e-mail.")
      return
    }
    setError("")
    setPendingId(user.id)
    setPendingAction("invite")
    const result = await postJson<InviteCreated>("/api/v1/users/invitations", {
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    })
    setPendingId(null)
    setPendingAction(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setCreated(result.data)
    setCreateOpen(true)
    router.refresh()
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }
    setError("")
    setPendingId(deleteTarget.id)
    setPendingAction("delete")
    const result = await deleteJson(`/api/v1/users/${deleteTarget.id}`)
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
            Équipe
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Utilisateurs
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Pilotez les comptes GVB : invitation, accès, et suppression.
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
          Créer un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Total"
          value={stats.total}
          icon={UsersIcon}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          label="Administrateurs"
          value={stats.admins}
          icon={ShieldIcon}
          active={filter === "admins"}
          onClick={() => selectFilter("admins")}
        />
        <StatCard
          label="Collecteurs"
          value={stats.collectors}
          icon={UserRoundIcon}
          active={filter === "collectors"}
          onClick={() => selectFilter("collectors")}
        />
        <StatCard
          label="En attente"
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
            <h2 className="font-medium">Annuaire</h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} compte{visible.length === 1 ? "" : "s"} affiché
              {visible.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un nom ou un e-mail"
              className="h-10 pl-10"
              aria-label="Rechercher un utilisateur"
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
                  Personne
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Rôle</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Accès
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
                    Aucun utilisateur ne correspond à cette vue.
                  </td>
                </tr>
              ) : (
                visible.map((user) => {
                  const isSelf = user.id === actorId
                  const busy = pendingId === user.id
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/40 text-xs font-semibold">
                            {initials(user.displayName) || "?"}
                          </span>
                          <div>
                            <p className="font-medium">
                              {user.displayName}
                              {isSelf ? (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                  Vous
                                </span>
                              ) : null}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {ROLE_LABELS[user.role]}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            user.access === "READY" ? "default" : "secondary"
                          }
                        >
                          {ACCESS_LABELS[user.access]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {user.status === "ACTIVE" ? "Actif" : "Désactivé"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <GvbUserRowMenu
                          user={user}
                          isSelf={isSelf}
                          busy={busy}
                          inviting={pendingAction === "invite" && busy}
                          onSetStatus={setStatus}
                          onResend={() => resendInvite(user)}
                          onDelete={() => setDeleteTarget(user)}
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
              {created ? "Invitation envoyée" : "Créer un utilisateur"}
            </SheetTitle>
            <SheetDescription>
              {created
                ? created.emailed
                  ? "Un e-mail d’activation a été envoyé. Vous pouvez aussi copier le lien."
                  : "L’e-mail n’a pas pu partir. Copiez le lien et transmettez-le."
                : "Un administrateur ou un collecteur GVB. Le mot de passe se définit à l’acceptation."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            {created ? (
              <div className="space-y-4 pt-2">
                <p className="text-sm">
                  {created.emailed ? "E-mail envoyé à " : "Lien pour "}
                  <span className="font-medium">{created.email}</span>
                </p>
                <p className="break-all rounded-2xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                  {created.invitationUrl}
                </p>
                <Button
                  type="button"
                  className="h-11 w-full rounded-2xl"
                  onClick={() => copyText(created.invitationUrl)}
                >
                  <CopyIcon className="size-4" />
                  {copied ? "Lien copié" : "Copier le lien"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-2xl"
                  onClick={() => setCreated(null)}
                >
                  Inviter quelqu’un d’autre
                </Button>
              </div>
            ) : (
              <InviteUserForm onCreated={setCreated} />
            )}
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
            <DialogTitle>Supprimer cet utilisateur ?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${deleteTarget.displayName} sera retiré définitivement. Les invitations qu’il a envoyées resteront, rattachées à votre compte.`
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

function GvbUserRowMenu({
  user,
  isSelf,
  busy,
  inviting,
  onSetStatus,
  onResend,
  onDelete,
}: {
  user: DirectoryUser
  isSelf: boolean
  busy: boolean
  inviting: boolean
  onSetStatus: (user: DirectoryUser, status: "ACTIVE" | "DISABLED") => void
  onResend: () => void
  onDelete: () => void
}) {
  if (isSelf) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={busy}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions pour ${user.displayName}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {user.status === "ACTIVE" ? (
          <DropdownMenuItem onClick={() => onSetStatus(user, "DISABLED")}>
            Désactiver
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onSetStatus(user, "ACTIVE")}>
            Réactiver
          </DropdownMenuItem>
        )}
        {user.access !== "READY" &&
        (user.role === "GVB_ADMIN" || user.role === "GVB_COLLECTOR") ? (
          <DropdownMenuItem onClick={onResend}>
            {inviting ? "Envoi…" : "Renvoyer l’invitation"}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  icon: typeof UsersIcon
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
