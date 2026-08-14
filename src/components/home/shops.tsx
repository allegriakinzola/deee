"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { HouseIcon } from "lucide-react"

import { ShopsMap } from "@/components/home/shops-map"
import { buttonVariants } from "@/components/ui/button"
import {
  PARTNERS,
  partnerName,
  shopsForPartner,
  type PartnerId,
} from "@/lib/shops"
import { cn } from "@/lib/utils"

function isPartnerId(value: string | null): value is PartnerId {
  return PARTNERS.some((partner) => partner.id === value)
}

export function Shops() {
  const searchParams = useSearchParams()
  const [partnerId, setPartnerId] = useState<PartnerId | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const fromUrl = searchParams.get("partenaire")
    if (isPartnerId(fromUrl)) {
      setPartnerId(fromUrl)
      setSelectedId(null)
    }
  }, [searchParams])

  const shops = useMemo(() => shopsForPartner(partnerId), [partnerId])

  function choosePartner(id: PartnerId | null) {
    setPartnerId(id)
    setSelectedId(null)
  }

  return (
    <section
      id="shops"
      className="scroll-mt-20 bg-linear-to-b from-primary/25 via-secondary/80 to-background"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-primary-foreground/80 uppercase">
            Points de collecte
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Nos shops
          </h2>
          <p className="mt-3 text-muted-foreground">
            Vodacom, Airtel, Orange, Equity BCDC, Rawbank et Bracongo ont chacun
            leurs points de collecte. Choisissez un partenaire, ou laissez « Tous »
            pour les voir tous sur la carte.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choosePartner(null)}
            className={cn(
              buttonVariants({
                variant: partnerId === null ? "default" : "outline",
                size: "lg",
              }),
              "rounded-full px-4"
            )}
          >
            Tous
          </button>
          {PARTNERS.map((partner) => {
            const active = partnerId === partner.id
            return (
              <button
                key={partner.id}
                type="button"
                onClick={() => choosePartner(partner.id)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-full border bg-white px-3 text-sm font-medium transition-colors",
                  active
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border hover:border-primary/60"
                )}
              >
                <Image
                  src={partner.logo}
                  alt=""
                  width={72}
                  height={24}
                  className="max-h-5 w-auto object-contain"
                />
                {partner.shortName}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-stretch">
          <ul className="flex max-h-[480px] flex-col gap-2 overflow-y-auto pr-1">
            {shops.map((shop) => {
              const active = shop.id === selectedId
              return (
                <li key={shop.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(shop.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/20"
                        : "border-border hover:bg-muted/60"
                    )}
                  >
                    <HouseIcon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        active ? "text-emerald-800" : "text-muted-foreground"
                      )}
                    />
                    <span>
                      <span className="block font-medium tracking-tight">
                        {shop.name}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {partnerName(shop.partnerId)} · {shop.area}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="min-h-[360px] overflow-hidden rounded-3xl border border-border bg-card lg:min-h-[480px]">
            <ShopsMap
              shops={shops}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
