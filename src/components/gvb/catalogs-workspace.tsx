"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  TagsIcon,
} from "lucide-react"

import { deleteJson, patchJson } from "@/lib/api"
import { DirectoryTableScroll } from "@/components/directory/list-layout"
import { CreateCatalogForm } from "@/components/gvb/create-catalog-form"
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
import type { DirectoryCatalog } from "@/modules/catalog"

function formatUsd(value: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return value
  }
  return amount.toLocaleString("fr-CD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

export function CatalogsWorkspace({
  catalogs,
  defaults,
}: {
  catalogs: DirectoryCatalog[]
  defaults: { usdPerPoint: string; bonUsdValue: string }
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DirectoryCatalog | null>(
    null
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return catalogs
    }
    return catalogs.filter((catalog) =>
      `${catalog.name} ${catalog.description ?? ""}`
        .toLowerCase()
        .includes(needle)
    )
  }, [catalogs, query])

  async function setStatus(
    catalog: DirectoryCatalog,
    status: "ACTIVE" | "DISABLED"
  ) {
    setError("")
    setPendingId(catalog.id)
    const result = await patchJson(`/api/v1/catalogs/${catalog.id}/status`, {
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
    const result = await deleteJson(`/api/v1/catalogs/${deleteTarget.id}`)
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
            Barème
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Catalogues
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Les points d’un dépôt se convertissent en bons. Un bon vaut{" "}
            {formatUsd(defaults.bonUsdValue)} USD — réglé dans{" "}
            <Link
              href="/admin/parametres"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Paramètres
            </Link>
            — et s’échange en shop contre du crédit ou une autre récompense.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 rounded-2xl px-4"
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon className="size-4" />
          Créer un catalogue
        </Button>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium">Annuaire</h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} catalogue{visible.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un catalogue"
              className="h-10 pl-10"
              aria-label="Rechercher un catalogue"
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
                  Catalogue
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Bon</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Articles
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
                    <TagsIcon className="mx-auto mb-3 size-8 opacity-50" />
                    Aucun catalogue pour l’instant.
                  </td>
                </tr>
              ) : (
                visible.map((catalog) => {
                  const busy = pendingId === catalog.id
                  return (
                    <tr
                      key={catalog.id}
                      className="border-t border-border/60 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/catalogue/${catalog.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {catalog.name}
                        </Link>
                        {catalog.description ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {catalog.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {catalog.pointsPerBon} pts ·{" "}
                        {formatUsd(catalog.bonUsdValue)} USD
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {catalog.itemCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            catalog.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {catalog.status === "ACTIVE" ? "Actif" : "Désactivé"}
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
                                aria-label={`Actions ${catalog.name}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/catalogue/${catalog.id}`)
                              }
                            >
                              Ouvrir
                            </DropdownMenuItem>
                            {catalog.status === "ACTIVE" ? (
                              <DropdownMenuItem
                                onClick={() => setStatus(catalog, "DISABLED")}
                              >
                                Désactiver
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setStatus(catalog, "ACTIVE")}
                              >
                                Réactiver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(catalog)}
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

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md"
          showCloseButton
        >
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>Nouveau catalogue</SheetTitle>
            <SheetDescription>
              Choisissez une catégorie, nommez le matériel et indiquez ses
              points.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            <CreateCatalogForm
              defaults={defaults}
              onCreated={() => setCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

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
            <DialogTitle>Supprimer ce catalogue ?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `« ${deleteTarget.name} » et tous ses articles seront retirés.`
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
