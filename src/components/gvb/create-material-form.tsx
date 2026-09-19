"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { postForm } from "@/lib/api"
import { CATALOG_GROUPS } from "@/lib/catalog-categories"
import { CatalogMaterialFields } from "@/components/gvb/catalog-material-fields"
import { MaterialImageField } from "@/components/gvb/material-image-field"
import { Button } from "@/components/ui/button"
import type { DirectoryMaterial } from "@/modules/materials"

export function CreateMaterialForm({
  usdPerPoint,
  onCreated,
}: {
  usdPerPoint: string
  onCreated: (material: DirectoryMaterial) => void
}) {
  const router = useRouter()
  const [category, setCategory] = useState<string>(CATALOG_GROUPS[0])
  const [name, setName] = useState("")
  const [points, setPoints] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (!image) {
      setError("Ajoutez une image du matériel.")
      return
    }
    setPending(true)

    const body = new FormData()
    body.append("category", category)
    body.append("name", name)
    body.append("points", points)
    body.append("image", image)

    const result = await postForm<DirectoryMaterial>("/api/v1/materials", body)

    setPending(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setName("")
    setPoints("")
    setImage(null)
    router.refresh()
    onCreated(result.data)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <MaterialImageField
        id="create-material-image"
        file={image}
        required
        onChange={setImage}
      />
      <CatalogMaterialFields
        fieldsId="create-material"
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
