"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  CircleCheckIcon,
  CircleOffIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  TicketPercentIcon,
} from "lucide-react"

import { deleteJson, patchForm, patchJson } from "@/lib/api"
import { formatUsd } from "@/lib/money"
import { CatalogMaterialFields } from "@/components/gvb/catalog-material-fields"
import { CreateMaterialForm } from "@/components/gvb/create-material-form"
import { MaterialImageField } from "@/components/gvb/material-image-field"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import {
  DirectoryPagination,
  usePagedRows,
} from "@/components/directory/pagination"
import { cn } from "@/lib/utils"
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
import type { DirectoryMaterial } from "@/modules/materials"

export function MaterialsWorkspace({
  materials,
  defaults,
}: {
  materials: DirectoryMaterial[]
  defaults: { usdPerPoint: string; bonUsdValue: string; pointsPerBon: number }
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL")
  const [category, setCategory] = useState("ALL")
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DirectoryMaterial | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DirectoryMaterial | null>(
    null
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const categories = useMemo(() => {
    const names = new Set(materials.map((item) => item.category))
    return [...names]
  }, [materials])

  const stats = useMemo(
    () => ({
      total: materials.length,
      active: materials.filter((item) => item.status === "ACTIVE").length,
      disabled: materials.filter((item) => item.status !== "ACTIVE").length,
    }),
    [materials]
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return materials.filter((item) => {
      if (status !== "ALL" && item.status !== status) {
        return false
      }
      if (category !== "ALL" && item.category !== category) {
        return false
      }
      if (!needle) {
        return true
      }
      return `${item.category} ${item.name}`.toLowerCase().includes(needle)
    })
  }, [category, materials, query, status])
  const paged = usePagedRows(visible, `${status}|${category}|${query}`)

  async function updateStatus(
    item: DirectoryMaterial,
    nextStatus: "ACTIVE" | "DISABLED"
  ) {
    setError("")
    setPendingId(item.id)
    const result = await patchJson(`/api/v1/materials/${item.id}/status`, {
      status: nextStatus,
    })
    setPendingId(null)
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
    const result = await deleteJson(`/api/v1/materials/${deleteTarget.id}`)
    setPendingId(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <div className="min-w-0 w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Matériels</h1>
        <Button
          type="button"
          className="h-11 rounded-2xl px-4"
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon className="size-4" />
          Ajouter un matériel
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatButton
          label="Total"
          value={stats.total}
          icon={PackageIcon}
          active={status === "ALL"}
          onClick={() => setStatus("ALL")}
        />
        <StatButton
          label="Actifs"
          value={stats.active}
          icon={CircleCheckIcon}
          active={status === "ACTIVE"}
          onClick={() => setStatus("ACTIVE")}
        />
        <StatButton
          label="Désactivés"
          value={stats.disabled}
          icon={CircleOffIcon}
          active={status === "DISABLED"}
          onClick={() => setStatus("DISABLED")}
        />
        <Link
          href="/admin/parametres"
          className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:bg-muted/40"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              1 bon
            </p>
            <TicketPercentIcon className="size-4 text-emerald-800/60" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
            {formatUsd(defaults.bonUsdValue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {defaults.pointsPerBon} points · Paramètres
          </p>
        </Link>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              label={`Toutes · ${materials.length}`}
              active={category === "ALL"}
              onClick={() => setCategory("ALL")}
            />
            {categories.map((name) => (
              <FilterChip
                key={name}
                label={`${name} · ${
                  materials.filter((item) => item.category === name).length
                }`}
                active={category === name}
                onClick={() => setCategory(name)}
              />
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom ou catégorie"
              className="h-9 pl-9"
              aria-label="Rechercher un matériel"
            />
          </div>
        </div>

        {error ? (
          <p className="border-b border-border/80 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DirectoryTableScroll>
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Matériel</th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Catégorie
                </th>
                <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                  Points
                </th>
                <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">
                  Équivalent
                </th>
                <th className="px-4 py-2.5 font-medium whitespace-nowrap">
                  Statut
                </th>
                <th className="px-4 py-2.5 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-14 text-center text-muted-foreground"
                  >
                    Aucun matériel dans cette sélection.
                  </td>
                </tr>
              ) : (
                paged.rows.map((item) => {
                  const busy = pendingId === item.id
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-10 shrink-0 overflow-hidden rounded-lg bg-muted",
                              item.status !== "ACTIVE" && "opacity-50"
                            )}
                          >
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                                —
                              </span>
                            )}
                          </span>
                          <span>
                            <span className="block font-medium">
                              {item.name}
                            </span>
                            {item.unit ? (
                              <span className="block text-xs text-muted-foreground">
                                {item.unit}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                        {item.category}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium whitespace-nowrap tabular-nums">
                        {item.points}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap text-muted-foreground tabular-nums">
                        {formatUsd(item.usdEquivalent)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Badge
                          variant={
                            item.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {item.status === "ACTIVE" ? "Actif" : "Désactivé"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={busy}
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions ${item.name}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => setEditTarget(item)}
                            >
                              Modifier
                            </DropdownMenuItem>
                            {item.status === "ACTIVE" ? (
                              <DropdownMenuItem
                                onClick={() => updateStatus(item, "DISABLED")}
                              >
                                Désactiver
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => updateStatus(item, "ACTIVE")}
                              >
                                Réactiver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(item)}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </DirectoryTableScroll>

        <DirectoryPagination
          page={paged.page}
          pageCount={paged.pageCount}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          emptyLabel="0 matériel"
          onPage={paged.setPage}
        />
      </section>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>Nouveau matériel</SheetTitle>
            <SheetDescription>
              Choisissez une photo, une catégorie, un nom et les points.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            <CreateMaterialForm
              usdPerPoint={defaults.usdPerPoint}
              onCreated={() => setCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {editTarget ? (
            <EditMaterialForm
              material={editTarget}
              usdPerPoint={defaults.usdPerPoint}
              onDone={() => {
                setEditTarget(null)
                router.refresh()
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce matériel ?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `« ${deleteTarget.name} » sera retiré de la liste.`
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
              disabled={pendingId === deleteTarget?.id}
              onClick={() => void confirmDelete()}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatButton({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  value: number
  icon: typeof PackageIcon
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-2xl bg-card p-4 text-left ring-2 ring-emerald-700/25"
          : "rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/10 hover:bg-muted/40"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <Icon className="size-4 text-emerald-800/60" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </button>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        active
          ? "bg-foreground text-background"
          : "bg-muted/70 text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}

function EditMaterialForm({
  material,
  usdPerPoint,
  onDone,
}: {
  material: DirectoryMaterial
  usdPerPoint: string
  onDone: () => void
}) {
  const [name, setName] = useState(material.name)
  const [category, setCategory] = useState(material.category)
  const [points, setPoints] = useState(String(material.points))
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    const body = new FormData()
    body.append("name", name)
    body.append("category", category)
    body.append("points", points)
    if (image) {
      body.append("image", image)
    }
    const result = await patchForm(`/api/v1/materials/${material.id}`, body)
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Modifier le matériel</DialogTitle>
        <DialogDescription>
          Photo, nom, catégorie et points.
        </DialogDescription>
      </DialogHeader>
      <MaterialImageField
        id="edit-material-image"
        file={image}
        currentSrc={material.image}
        onChange={setImage}
      />
      <CatalogMaterialFields
        fieldsId="edit-material"
        category={category}
        name={name}
        points={points}
        usdPerPoint={usdPerPoint}
        onCategoryChange={setCategory}
        onNameChange={setName}
        onPointsChange={setPoints}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DialogFooter>
        <Button type="submit" disabled={pending} className="rounded-2xl">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </DialogFooter>
    </form>
  )
}