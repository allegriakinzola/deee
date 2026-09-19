"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MoreHorizontalIcon, PlusIcon, SearchIcon } from "lucide-react"

import { deleteJson, patchForm, patchJson } from "@/lib/api"
import { CatalogMaterialFields } from "@/components/gvb/catalog-material-fields"
import { CreateMaterialForm } from "@/components/gvb/create-material-form"
import { MaterialImageField } from "@/components/gvb/material-image-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export function MaterialsWorkspace({
  materials,
  defaults,
}: {
  materials: DirectoryMaterial[]
  defaults: { usdPerPoint: string; bonUsdValue: string; pointsPerBon: number }
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DirectoryMaterial | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DirectoryMaterial | null>(
    null
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return materials
    }
    return materials.filter((item) =>
      `${item.category} ${item.name}`.toLowerCase().includes(needle)
    )
  }, [materials, query])

  const groups = useMemo(() => {
    const byCategory = new Map<string, DirectoryMaterial[]>()
    for (const item of visible) {
      const list = byCategory.get(item.category) ?? []
      list.push(item)
      byCategory.set(item.category, list)
    }
    return [...byCategory.entries()]
  }, [visible])

  async function setStatus(
    item: DirectoryMaterial,
    status: "ACTIVE" | "DISABLED"
  ) {
    setError("")
    setPendingId(item.id)
    const result = await patchJson(`/api/v1/materials/${item.id}/status`, {
      status,
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
    <div className="mx-auto min-w-0 max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
            DEEE
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Matériels
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            1 bon = {formatUsd(defaults.bonUsdValue)} USD ={" "}
            {defaults.pointsPerBon} points. La valeur du bon se règle dans{" "}
            <Link
              href="/admin/parametres"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Paramètres
            </Link>
            .
          </p>
        </div>
        <Button
          type="button"
          className="h-11 rounded-2xl px-4"
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon className="size-4" />
          Ajouter un matériel
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {visible.length} matériel{visible.length === 1 ? "" : "s"}
        </p>
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-16 text-center text-muted-foreground ring-1 ring-foreground/10">
          Aucun matériel pour l’instant.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const busy = pendingId === item.id
                  return (
                    <Card key={item.id} size="sm" className="gap-0 py-0">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-sm text-muted-foreground">
                            Sans image
                          </span>
                        )}
                        {item.status !== "ACTIVE" ? (
                          <span className="absolute inset-0 bg-background/55" />
                        ) : null}
                      </div>
                      <CardHeader className="border-b border-border/60 pt-3">
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>
                          {item.points} pts · {formatUsd(item.usdEquivalent)}{" "}
                          USD
                        </CardDescription>
                        <CardAction>
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
                                  onClick={() => setStatus(item, "DISABLED")}
                                >
                                  Désactiver
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setStatus(item, "ACTIVE")}
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
                        </CardAction>
                      </CardHeader>
                      <CardContent className="py-3">
                        <Badge
                          variant={
                            item.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {item.status === "ACTIVE" ? "Actif" : "Désactivé"}
                        </Badge>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

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
