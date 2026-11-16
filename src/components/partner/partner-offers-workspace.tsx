"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { deleteJson, patchForm, postForm } from "@/lib/api"
import {
  DirectoryPagination,
  usePagedRows,
} from "@/components/directory/pagination"
import { OfferPhotoField } from "@/components/partner/offer-photo-field"
import {
  rewardKindExamples,
  rewardKindLabel,
  type RewardKind,
} from "@/lib/reward-offers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { PartnerOfferBoard } from "@/modules/partners"

export function PartnerOffersWorkspace({ board }: { board: PartnerOfferBoard }) {
  const router = useRouter()
  const [label, setLabel] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [photoKey, setPhotoKey] = useState(0)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [editTarget, setEditTarget] = useState<PartnerOfferBoard["offers"][number] | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<
    PartnerOfferBoard["offers"][number] | null
  >(null)
  const paged = usePagedRows(board.offers, String(board.offers.length))

  async function createOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    const body = new FormData()
    body.append("label", label)
    if (image) body.append("image", image)
    const result = await postForm("/api/v1/partners/offers", body)
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setLabel("")
    setImage(null)
    setPhotoKey((current) => current + 1)
    router.refresh()
  }

  return (
    <div className="min-w-0 w-full space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Récompenses
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Offres</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {introFor(board.rewardKind)} Le citoyen les voit au moment de
          l’échange, dans vos shops.
        </p>
      </div>

      <form
        onSubmit={(event) => void createOffer(event)}
        className="space-y-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
      >
        <Field label="Nouvelle offre" htmlFor="offer-label">
          <Input
            id="offer-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={placeholderFor(board.rewardKind)}
            required
          />
        </Field>
        <OfferPhotoField
          key={photoKey}
          id="offer-image"
          file={image}
          onChange={setImage}
        />
        <Button type="submit" disabled={pending} className="h-12 rounded-2xl">
          <PlusIcon className="size-4" />
          {pending ? "Ajout…" : "Ajouter"}
        </Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        {board.offers.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Aucune offre. Ajoutez-en une pour que vos shops puissent échanger.
          </p>
        ) : (
          <ul>
            {paged.rows.map((offer) => (
              <li
                key={offer.id}
                className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 first:border-t-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {offer.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={offer.image}
                      alt=""
                      className="size-12 shrink-0 rounded-xl bg-white object-cover ring-1 ring-foreground/10"
                    />
                  ) : (
                    <span className="size-12 shrink-0 rounded-xl bg-muted" />
                  )}
                  <p className="truncate font-medium">{offer.label}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Modifier ${offer.label}`}
                    onClick={() => setEditTarget(offer)}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Retirer ${offer.label}`}
                    onClick={() => setDeleteTarget(offer)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {board.offers.length > 0 ? (
          <DirectoryPagination
            page={paged.page}
            pageCount={paged.pageCount}
            total={paged.total}
            from={paged.from}
            to={paged.to}
            emptyLabel="0 offre"
            onPage={paged.setPage}
          />
        ) : null}
      </section>

      <EditOfferSheet
        offer={editTarget}
        onClose={() => setEditTarget(null)}
      />
      <DeleteOfferDialog
        offer={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function introFor(kind: PartnerOfferBoard["rewardKind"]) {
  const examples = rewardKindExamples(kind as RewardKind)
  const name = rewardKindLabel(kind as RewardKind).toLowerCase()
  if (kind === "FORFAIT") {
    return `Vos shops échangent les points contre un forfait (${examples}).`
  }
  if (kind === "PRODUIT") {
    return `Vos shops échangent les points contre un produit physique (${examples}).`
  }
  return `Vos shops échangent les points contre un ${name} (${examples}).`
}

function placeholderFor(kind: PartnerOfferBoard["rewardKind"]) {
  if (kind === "FORFAIT") return "Forfait data 1 Go"
  if (kind === "PRODUIT") return "Powerbank"
  return "Installation en shop"
}

function EditOfferSheet({
  offer,
  onClose,
}: {
  offer: PartnerOfferBoard["offers"][number] | null
  onClose: () => void
}) {
  return (
    <Sheet
      open={offer !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border/80">
          <SheetTitle>Modifier l’offre</SheetTitle>
          <SheetDescription>
            Le libellé et la photo valent pour les prochains échanges.
          </SheetDescription>
        </SheetHeader>
        {offer ? (
          <EditOfferForm key={offer.id} offer={offer} onClose={onClose} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function EditOfferForm({
  offer,
  onClose,
}: {
  offer: PartnerOfferBoard["offers"][number]
  onClose: () => void
}) {
  const router = useRouter()
  const [label, setLabel] = useState(offer.label)
  const [image, setImage] = useState<File | null>(null)
  const [cleared, setCleared] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)
    const body = new FormData()
    body.append("label", label)
    if (image) body.append("image", image)
    if (cleared && !image) body.append("removeImage", "1")
    const result = await patchForm(`/api/v1/partners/offers/${offer.id}`, body)
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
    >
      <Field label="Libellé" htmlFor="edit-offer-label">
        <Input
          id="edit-offer-label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          required
        />
      </Field>
      <OfferPhotoField
        id="edit-offer-image"
        file={image}
        currentSrc={cleared ? null : offer.image}
        onChange={(file) => {
          setImage(file)
          if (file) setCleared(false)
        }}
        onClear={() => {
          setImage(null)
          setCleared(true)
        }}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 rounded-2xl">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  )
}

function DeleteOfferDialog({
  offer,
  onClose,
}: {
  offer: PartnerOfferBoard["offers"][number] | null
  onClose: () => void
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function remove() {
    if (!offer) return
    setError("")
    setPending(true)
    const result = await deleteJson(`/api/v1/partners/offers/${offer.id}`)
    setPending(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <Dialog
      open={offer !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retirer cette offre ?</DialogTitle>
          <DialogDescription>
            {offer
              ? `« ${offer.label} » ne sera plus proposé dans vos shops. Les échanges déjà envoyés conservent leur libellé.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" disabled={pending} onClick={() => void remove()}>
            {pending ? "Retrait…" : "Retirer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
