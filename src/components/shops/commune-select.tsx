"use client"

import { KINSHASA_COMMUNES } from "@/lib/kinshasa-communes"

const SELECT_CLASS =
  "h-12 w-full rounded-2xl border border-transparent bg-muted/70 px-4 text-sm outline-none hover:bg-muted focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/50"

export function CommuneSelect({
  id,
  value,
  onChange,
  required,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  const extra =
    value && !(KINSHASA_COMMUNES as readonly string[]).includes(value)
      ? [value]
      : []

  return (
    <select
      id={id}
      name="area"
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={SELECT_CLASS}
    >
      <option value="" disabled>
        Choisir une commune
      </option>
      {extra.map((commune) => (
        <option key={commune} value={commune}>
          {commune}
        </option>
      ))}
      {KINSHASA_COMMUNES.map((commune) => (
        <option key={commune} value={commune}>
          {commune}
        </option>
      ))}
    </select>
  )
}
