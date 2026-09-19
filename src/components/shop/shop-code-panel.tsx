"use client"

import { useState } from "react"
import Link from "next/link"
import { CopyIcon } from "lucide-react"

import { displayShopCode } from "@/lib/shop-code"
import { Button } from "@/components/ui/button"

export function ShopCodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const shown = displayShopCode(code)

  async function copy() {
    await navigator.clipboard.writeText(shown)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-card px-5 py-6 ring-1 ring-foreground/10">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
        Code à communiquer
      </p>
      <p className="mt-3 font-mono text-4xl font-semibold tracking-[0.2em]">
        {shown}
      </p>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Donnez ce code au citoyen au moment du dépôt. Il le saisit dans
        l’application puis clique sur Envoyer.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void copy()}>
          <CopyIcon className="size-4" />
          {copied ? "Copié" : "Copier le code"}
        </Button>
        <Link
          href="/shop/depots"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Voir les dépôts
        </Link>
      </div>
    </div>
  )
}
