"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postJson } from "@/lib/api"
import { CATALOG_GROUPS } from "@/lib/catalog-categories"
import { CatalogMaterialFields } from "@/components/gvb/catalog-material-fields"
import { Button } from "@/components/ui/button"
import { Field, Input } from "@/components/ui/input"
import type { DirectoryCatalog, DirectoryCatalogItem } from "@/modules/catalog"

export function CreateCatalogForm({
  defaults,
  onCreated,
}: {
  defaults: { usdPerPoint: string; bonUsdValue: string }
  onCreated: (catalog: DirectoryCatalog) => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<string>(CATALOG_GROUPS[0])
  const [materialName, setMaterialName] = useState("")
  const [points, setPoints] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setPending(true)

    const created = await postJson<DirectoryCatalog>("/api/v1/catalogs", {
      name,
    })

    if (!created.ok) {
      setPending(false)
      setError(created.message)
      return
    }

    const item = await postJson<DirectoryCatalogItem>(
      `/api/v1/catalogs/${created.data.id}/items`,
      {
        category,
        name: materialName,
        points,
      }
    )

    setPending(false)

    if (!item.ok) {
      setError(item.message)
      router.refresh()
      onCreated(created.data)
      router.push(`/admin/catalogue/${created.data.id}`)
      return
    }

    setName("")
    setMaterialName("")
    setPoints("")
    router.refresh()
    onCreated(created.data)
    router.push(`/admin/catalogue/${created.data.id}`)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <Field label="Nom du catalogue" htmlFor="catalog-name">
        <Input
          id="catalog-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex. Barème DEEE 2026"
        />
      </Field>
      <CatalogMaterialFields
        fieldsId="create-catalog"
        category={category}
        name={materialName}
        points={points}
        usdPerPoint={defaults.usdPerPoint}
        onCategoryChange={setCategory}
        onNameChange={setMaterialName}
        onPointsChange={setPoints}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-11 rounded-2xl"
      >
        {pending ? "Création…" : "Créer le catalogue"}
      </Button>
    </form>
  )
}
