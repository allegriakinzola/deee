"use client"

import { useEffect, useState } from "react"

const ACCEPT = "image/jpeg,image/png,image/webp"

export function PartnerLogoField({
  id,
  file,
  currentSrc,
  hint = "JPEG, PNG ou WebP · 2 Mo maximum.",
  onChange,
}: {
  id: string
  file: File | null
  currentSrc?: string | null
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
  const title = file
    ? file.name
    : currentSrc
      ? "Remplacer le logo"
      : "Ajouter un logo"

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">
        Logo{" "}
        <span className="font-normal text-muted-foreground">· facultatif</span>
      </p>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-background px-3 py-3 hover:bg-muted/50"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt=""
            className="size-12 shrink-0 rounded-xl bg-white object-contain ring-1 ring-foreground/10"
          />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-[11px] font-medium text-muted-foreground">
            Logo
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {hint}
          </span>
        </span>
        <input
          key={inputKey}
          id={id}
          name="logo"
          type="file"
          accept={ACCEPT}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
      </label>
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
  )
}
