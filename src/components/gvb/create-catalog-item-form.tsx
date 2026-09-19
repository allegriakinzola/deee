"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postJson } from "@/lib/api"
import { CATALOG_GROUPS } from "@/lib/catalog-categories"
import { CatalogMaterialFields } from "@/components/gvb/catalog-material-fields"
import { Button } from "@/components/ui/button"
import type { DirectoryCatalogItem } from "@/modules/catalog"

export function CreateCatalogItemForm({
  catalogId,
  usdPerPoint,
  onCreated,
}: {
  catalogId: string
  usdPerPoint: string
  onCreated: (item: DirectoryCatalogItem) => void
}) {
  const router = useRouter()
  const [category, setCategory] = useState<string>(CATALOG_GROUPS[0])
  const [name, setName] = useState("")
  const [points, setPoints] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    const result = await postJson<DirectoryCatalogItem>(
      `/api/v1/catalogs/${catalogId}/items`,
      {
        category,
        name,
        points,
      }
    )

    setPending(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setName("")
    setPoints("")
    router.refresh()
    onCreated(result.data)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <CatalogMaterialFields
        fieldsId="create-item"
        category={category}
        name={name}
        points={points}
        usdPerPoint={usdPerPoint}
        onCategoryChange={setCategory}
        onNameChange={setName}
        onPointsChange={setPoints}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 rounded-2xl"
      >
        {pending ? "Ajout…" : "Ajouter le matériel"}
      </Button>
    </form>
  )
}
