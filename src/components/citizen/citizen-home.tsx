import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  MapPinIcon,
  QrCodeIcon,
  RecycleIcon,
  SmartphoneIcon,
  SparklesIcon,
} from "lucide-react"

import { SHOPS } from "@/lib/shops"

const NEAREST = SHOPS.find((shop) => shop.id === "vodacom-gombe") ?? SHOPS[0]

export function CitizenHome({ displayName }: { displayName: string }) {
  const firstName = displayName.trim().split(/\s+/)[0] || displayName

  return (
    <div className="flex flex-col gap-3 pb-1 lg:gap-6">
      <section className="rounded-2xl bg-primary px-4 py-4 text-primary-foreground lg:px-8 lg:py-6">
        <p className="text-[11px] font-medium tracking-wide uppercase lg:text-xs">
          Mon solde
        </p>
        <p className="mt-3 text-sm font-medium leading-relaxed lg:text-base">
          En attente d’alimentation des données
        </p>
        <p className="mt-2 text-[13px] opacity-80 lg:text-sm">
          Vos points apparaîtront ici, {firstName}.
        </p>
      </section>

      <div className="grid grid-cols-4 gap-2 lg:gap-4">
        <QuickAction icon={QrCodeIcon} label="Déposer" soon />
        <QuickAction href="/compte/shops" icon={MapPinIcon} label="Shops" />
        <QuickAction icon={SmartphoneIcon} label="Catalogue" soon />
        <QuickAction icon={SparklesIcon} label="Échanger" soon />
      </div>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-6">
        <section className="rounded-2xl bg-white px-3.5 py-3 lg:px-5 lg:py-5">
          <p className="text-sm font-semibold text-zinc-900 lg:text-base">
            Dernier dépôt
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/50 text-primary-foreground lg:size-12">
              <RecycleIcon className="size-5 lg:size-6" />
            </span>
            <p className="text-sm text-zinc-500 lg:text-base">
              En attente d’alimentation des données
            </p>
          </div>
        </section>

        <Link
          href={`https://www.google.com/maps?q=${NEAREST.lat},${NEAREST.lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 lg:px-5 lg:py-5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/50 text-primary-foreground lg:size-12">
            <MapPinIcon className="size-5 lg:size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight text-zinc-900 lg:text-base">
              Shop le plus proche
            </p>
            <p className="truncate text-[12px] text-zinc-500 lg:text-sm">
              {NEAREST.name} · {NEAREST.area} · ouvert
            </p>
          </div>
          <span className="text-[13px] font-semibold text-emerald-800 lg:text-sm">
            Y aller
          </span>
        </Link>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  soon = false,
}: {
  href?: string
  icon: LucideIcon
  label: string
  soon?: boolean
}) {
  const content = (
    <>
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/50 text-primary-foreground lg:size-14">
        <Icon className="size-5 lg:size-6" />
      </span>
      <span className="text-[11px] font-medium text-zinc-600 lg:text-sm">
        {label}
      </span>
      {soon ? (
        <span className="text-[9px] font-medium tracking-wide text-zinc-400 uppercase lg:text-[10px]">
          Bientôt
        </span>
      ) : null}
    </>
  )

  if (!href || soon) {
    return (
      <span className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-zinc-400 lg:gap-2 lg:py-5">
        {content}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 lg:gap-2 lg:py-5"
    >
      {content}
    </Link>
  )
}
