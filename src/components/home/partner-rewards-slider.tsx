"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PARTNERS, rewardCopy } from "@/lib/shops"
import { cn } from "@/lib/utils"

export function PartnerRewardsSlider() {
  const [index, setIndex] = useState(0)
  const partner = PARTNERS[index]
  const copy = rewardCopy(partner)

  function go(next: number) {
    setIndex((next + PARTNERS.length) % PARTNERS.length)
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PARTNERS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={item.name}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "flex h-14 items-center justify-center rounded-xl border bg-white px-2 transition-colors",
              i === index
                ? "border-primary ring-2 ring-primary/40"
                : "border-border hover:border-primary/60"
            )}
          >
            <Image
              src={item.logo}
              alt={item.name}
              width={100}
              height={36}
              className="max-h-7 w-auto object-contain"
            />
          </button>
        ))}
      </div>

      <Card className="overflow-hidden bg-secondary/70 ring-border">
        <CardContent className="space-y-3 p-6">
          <div className="flex h-16 items-center justify-center rounded-xl bg-white px-4">
            <Image
              src={partner.logo}
              alt={`Logo ${partner.name}`}
              width={140}
              height={48}
              className="max-h-10 w-auto object-contain"
            />
          </div>
          <div className="rounded-xl bg-card px-4 py-4">
            <p className="text-sm text-muted-foreground">{partner.name}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {copy.title}
            </p>
          </div>
          <div className="rounded-xl bg-card px-4 py-4">
            <p className="text-sm text-muted-foreground">Échange type</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {copy.detail}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Partenaire précédent"
          onClick={() => go(index - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Partenaire suivant"
          onClick={() => go(index + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
