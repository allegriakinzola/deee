"use client"

import { useState } from "react"
import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ShopReportDownloadButton() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function download() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/v1/shops/report")
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { message?: string }
        } | null
        setError(
          payload?.error?.message ?? "Impossible de générer le rapport."
        )
        return
      }
      const blob = await response.blob()
      const header = response.headers.get("Content-Disposition")
      const match = header?.match(/filename="([^"]+)"/)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = match?.[1] ?? "rapport-shop.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError("Impossible de joindre le serveur.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shrink-0">
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => void download()}
      >
        <DownloadIcon data-icon="inline-start" />
        {busy ? "Préparation…" : "Télécharger le rapport PDF"}
      </Button>
      {error ? (
        <p className="mt-2 max-w-xs text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
