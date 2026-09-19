"use client"

import { CATALOG_GROUPS } from "@/lib/catalog-categories"
import { Field, Input } from "@/components/ui/input"

const selectClassName =
  "h-12 w-full rounded-2xl border border-transparent bg-muted/70 px-4 text-sm outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"

export function CatalogMaterialFields({
  category,
  name,
  points,
  usdPerPoint,
  fieldsId = "item",
  onCategoryChange,
  onNameChange,
  onPointsChange,
}: {
  category: string
  name: string
  points: string
  usdPerPoint: string
  fieldsId?: string
  onCategoryChange: (group: string) => void
  onNameChange: (name: string) => void
  onPointsChange: (points: string) => void
}) {
  const pointValue = Number(usdPerPoint)
  const pts = Number(points.replace(",", "."))
  const usd =
    Number.isFinite(pointValue) && Number.isFinite(pts) && pts > 0
      ? pts * pointValue
      : null

  return (
    <>
      <Field label="Catégorie" htmlFor={`${fieldsId}-category`}>
        <select
          id={`${fieldsId}-category`}
          className={selectClassName}
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {CATALOG_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Nom du matériel"
        htmlFor={`${fieldsId}-name`}
        hint="Un matériel = un nom. Ex. Souris, Clavier, SSD."
      >
        <Input
          id={`${fieldsId}-name`}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Ex. Souris"
        />
      </Field>
      <Field
        label="Points"
        htmlFor={`${fieldsId}-points`}
        hint={
          usd !== null
            ? `Soit ${usd.toLocaleString("fr-CD", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} USD`
            : "Indiquez les points liés à ce matériel."
        }
      >
        <Input
          id={`${fieldsId}-points`}
          inputMode="numeric"
          value={points}
          onChange={(event) => onPointsChange(event.target.value)}
        />
      </Field>
    </>
  )
}
