import type { Metadata } from "next"
import Link from "next/link"
import { MapPinIcon } from "lucide-react"

import { listPublicDirectory } from "@/modules/shops"

export const metadata: Metadata = {
  title: "Shops",
  robots: { index: false, follow: false },
}

export default async function CitizenShopsPage() {
  const { shops } = await listPublicDirectory()

  return (
    <div className="flex flex-col gap-2 pb-2">
      <div className="px-0.5 pb-1">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 lg:text-2xl">
          Shops
        </h1>
        <p className="mt-0.5 text-[13px] text-zinc-500 lg:text-sm">
          Points de dépôt des déchets électriques et électroniques à Kinshasa
        </p>
      </div>
      {shops.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-sm text-zinc-500">
          Aucun shop actif pour le moment.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl bg-white lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible lg:bg-transparent">
          {shops.map((shop, index) => (
            <li
              key={shop.id}
              className="lg:overflow-hidden lg:rounded-2xl lg:bg-white"
            >
              {index > 0 ? (
                <div className="mx-3.5 h-px bg-zinc-100 lg:hidden" />
              ) : null}
              <Link
                href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3.5 py-3 lg:px-4 lg:py-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/50 text-primary-foreground">
                  <MapPinIcon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {shop.name}
                  </p>
                  <p className="truncate text-[12px] text-zinc-500">
                    {shop.partnerName} · {shop.area}
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-emerald-800">
                  Y aller
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
