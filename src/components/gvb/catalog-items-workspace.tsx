"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, MoreHorizontalIcon, PlusIcon, SearchIcon } from "lucide-react"

import { deleteJson, patchJson } from "@/lib/api"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import { CatalogMaterialFields } from "@/components/gvb/catalog-material-fields"
import { CreateCatalogItemForm } from "@/components/gvb/create-catalog-item-form"
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
import { Field, Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  DirectoryCatalog,
  DirectoryCatalogDetail,
  DirectoryCatalogItem,
} from "@/modules/catalog"

function formatUsd(value: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return value
  }
  return amount.toLocaleString("fr-CD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function CatalogItemsWorkspace({
  catalog,
}: {
  catalog: DirectoryCatalogDetail
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editCatalogOpen, setEditCatalogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DirectoryCatalogItem | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<DirectoryCatalogItem | null>(
    null
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return catalog.items
    }
    return catalog.items.filter((item) =>
      `${item.category} ${item.name}`.toLowerCase().includes(needle)
    )
  }, [catalog.items, query])

  async function setItemStatus(
    item: DirectoryCatalogItem,
    status: "ACTIVE" | "DISABLED"
  ) {
    setError("")
    setPendingId(item.id)
    const result = await patchJson(
      `/api/v1/catalogs/${catalog.id}/items/${item.id}/status`,
      { status }
    )
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
    const result = await deleteJson(
      `/api/v1/catalogs/${catalog.id}/items/${deleteTarget.id}`
    )
    setPendingId(null)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-8">
      <div>
        <Link
          href="/admin/catalogue"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Catalogues
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
              Barème
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {catalog.name}
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              1 bon = {formatUsd(catalog.bonUsdValue)} USD ={" "}
              {catalog.pointsPerBon} points. La valeur du bon se règle dans{" "}
              <Link
                href="/admin/parametres"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Paramètres
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl px-4"
              onClick={() => setEditCatalogOpen(true)}
            >
              Modifier le barème
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl px-4"
              onClick={() => setCreateOpen(true)}
            >
              <PlusIcon className="size-4" />
              Ajouter un matériel
            </Button>
          </div>
        </div>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">Matériels</h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} matériel{visible.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un matériel"
              className="h-10 pl-10"
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
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Matériel
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Catégorie
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Points
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">USD</th>
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
                    colSpan={6}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    Aucun matériel dans ce catalogue.
                  </td>
                </tr>
              ) : (
                visible.map((item) => {
                  const busy = pendingId === item.id
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.points}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatUsd(item.usdEquivalent)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            item.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {item.status === "ACTIVE" ? "Actif" : "Désactivé"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
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
                            <DropdownMenuItem onClick={() => setEditTarget(item)}>
                              Modifier
                            </DropdownMenuItem>
                            {item.status === "ACTIVE" ? (
                              <DropdownMenuItem
                                onClick={() => setItemStatus(item, "DISABLED")}
                              >
                                Désactiver
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setItemStatus(item, "ACTIVE")}
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
      </section>

      <Sheet open={editCatalogOpen} onOpenChange={setEditCatalogOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>Modifier le barème</SheetTitle>
            <SheetDescription>
              Les points des articles se convertissent avec ce barème. La valeur
              d’un bon se règle dans Paramètres.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            <EditCatalogForm
              catalog={catalog}
              onDone={() => {
                setEditCatalogOpen(false)
                router.refresh()
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>Nouveau matériel</SheetTitle>
            <SheetDescription>
              Choisissez une catégorie, nommez le matériel et indiquez ses
              points.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            <CreateCatalogItemForm
              catalogId={catalog.id}
              usdPerPoint={catalog.usdPerPoint}
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
        <DialogContent>
          {editTarget ? (
            <EditCatalogItemForm
              catalogId={catalog.id}
              item={editTarget}
              usdPerPoint={catalog.usdPerPoint}
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
              {deleteTarget ? `« ${deleteTarget.name} » sera retiré du barème.` : null}
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

function EditCatalogForm({
  catalog,
  onDone,
}: {
  catalog: DirectoryCatalog
  onDone: () => void
}) {
  const [name, setName] = useState(catalog.name)
  const [usdPerPoint, setUsdPerPoint] = useState(catalog.usdPerPoint)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const point = Number(usdPerPoint.replace(",", "."))
  const bon = Number(catalog.bonUsdValue.replace(",", "."))
  const pointsPerBonPreview =
    Number.isFinite(point) && Number.isFinite(bon) && point > 0
      ? Math.round(bon / point)
      : 0

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    const result = await patchJson(`/api/v1/catalogs/${catalog.id}`, {
      name,
      usdPerPoint,
    })
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <Field label="Nom" htmlFor="edit-catalog-name">
        <Input
          id="edit-catalog-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field
        label="USD par point"
        htmlFor="edit-usd-point"
        hint="50 points = 2 USD → 0,04"
      >
        <Input
          id="edit-usd-point"
          inputMode="decimal"
          value={usdPerPoint}
          onChange={(event) => setUsdPerPoint(event.target.value)}
        />
      </Field>
      <p className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
        {pointsPerBonPreview >= 1 ? (
          <>
            1 bon = {catalog.bonUsdValue.replace(".", ",")} USD ={" "}
            {pointsPerBonPreview} points. Modifiez la valeur du bon dans{" "}
            <Link
              href="/admin/parametres"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Paramètres
            </Link>
            .
          </>
        ) : (
          "Indiquez un USD par point valide."
        )}
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 rounded-2xl"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  )
}

function EditCatalogItemForm({
  catalogId,
  item,
  usdPerPoint,
  onDone,
}: {
  catalogId: string
  item: DirectoryCatalogItem
  usdPerPoint: string
  onDone: () => void
}) {
  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [points, setPoints] = useState(String(item.points))
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    const result = await patchJson(
      `/api/v1/catalogs/${catalogId}/items/${item.id}`,
      { name, category, points }
    )
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
          Les points sont liés à ce matériel.
        </DialogDescription>
      </DialogHeader>
      <CatalogMaterialFields
        fieldsId="edit-item"
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
