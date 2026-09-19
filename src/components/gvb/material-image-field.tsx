"use client"

import { useEffect, useState } from "react"

import { Field } from "@/components/ui/input"

const ACCEPT = "image/jpeg,image/png,image/webp"

export function MaterialImageField({
  id,
  file,
  currentSrc,
  required = false,
  hint = "JPEG, PNG ou WebP · 2 Mo maximum.",
  onChange,
}: {
  id: string
  file: File | null
  currentSrc?: string | null
  required?: boolean
  hint?: string
  onChange: (file: File | null) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const shown = preview ?? currentSrc ?? null

  return (
    <Field
      label="Image"
      htmlFor={id}
      hint={
        required && !shown
          ? "Une photo de référence est obligatoire."
          : hint
      }
    >
      <div className="flex items-center gap-3">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt=""
            className="size-16 shrink-0 rounded-xl bg-muted object-cover ring-1 ring-foreground/10"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
            Photo
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <input
            key={inputKey}
            id={id}
            name="image"
            type="file"
            accept={ACCEPT}
            required={required && !currentSrc}
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
            className="w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-primary/35 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-primary/45"
          />
          {file ? (
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => {
                onChange(null)
                setInputKey((current) => current + 1)
              }}
            >
              Retirer le fichier
            </button>
          ) : null}
        </div>
      </div>
    </Field>
  )
}
