import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  MapPinIcon,
  RecycleIcon,
  SmartphoneIcon,
  SparklesIcon,
} from "lucide-react"

import { PeriodChart } from "@/components/dashboard/period-chart"
import { formatUsd } from "@/lib/money"
import { SHOPS } from "@/lib/shops"
import type { CitizenDashboard } from "@/modules/deposits"

const NEAREST = SHOPS.find((shop) => shop.id === "vodacom-gombe") ?? SHOPS[0]

export function CitizenHome({
  displayName,
  data,
}: {
  displayName: string
  data: CitizenDashboard
}) {
  const {
    points,
    availablePoints,
    bonsAvailable,
    pointsPerBon,
    lastDeposit,
  } = data
  const firstName = displayName.trim().split(/\s+/)[0] || displayName
  const pointsToBon = Math.max(0, pointsPerBon - availablePoints)

  return (
    <div className="flex flex-col gap-3 pb-1 lg:gap-6">
      <section className="rounded-2xl bg-primary px-4 py-4 text-primary-foreground lg:px-8 lg:py-6">
        <p className="text-[11px] font-medium tracking-wide uppercase lg:text-xs">
          Mon solde
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          {points} pts
        </p>
        <p className="mt-2 text-[13px] opacity-80 lg:text-sm">
          {points === 0
            ? `Déposez un appareil en shop pour créditer votre compte, ${firstName}.`
            : bonsAvailable < 1
              ? `Encore ${pointsToBon} pts pour 1 bon, ${firstName}.`
              : `${bonsAvailable} bon${bonsAvailable === 1 ? "" : "s"} à échanger en shop, ${firstName}.`}
        </p>
      </section>

      <div className="grid grid-cols-4 gap-2 lg:gap-4">
        <QuickAction href="/compte/depot" icon={RecycleIcon} label="Déposer" />
        <QuickAction href="/compte/shops" icon={MapPinIcon} label="Shops" />
        <QuickAction icon={SmartphoneIcon} label="Catalogue" soon />
        <QuickAction href="/compte/echange" icon={SparklesIcon} label="Échanger" />
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
            {lastDeposit ? (
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 lg:text-base">
                  {lastDeposit.shopName}
                </p>
                <p className="text-[12px] text-zinc-500 lg:text-sm">
                  +{lastDeposit.points} pts
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 lg:text-base">
                Aucun dépôt confirmé pour l’instant.
              </p>
            )}
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <MiniStat
          label="Dépôts en attente"
          value={String(data.pendingDeposits)}
          href="/compte/depot"
        />
        <MiniStat
          label="Échanges en attente"
          value={String(data.pendingRedeems)}
          href="/compte/echange"
        />
        <MiniStat
          label="Dépôts (30 j)"
          value={String(data.confirmedDeposits30)}
          hint={`${data.pointsCredited30} pts`}
        />
        <MiniStat
          label="Échanges (30 j)"
          value={String(data.confirmedRedeems30)}
          hint={`${data.bons30} bon${data.bons30 === 1 ? "" : "s"} · ${formatUsd(data.usd30)}`}
        />
      </div>

      <section className="rounded-2xl bg-white px-3.5 py-4 lg:px-5 lg:py-5">
        <PeriodChart points={data.daily} />
      </section>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-6">
        <CitizenTable
          title="Mes matériels"
          empty="Aucun dépôt confirmé sur 30 jours."
          headers={["Article", "Qté", "Pts"]}
          rows={data.topMaterials.map((item) => [
            item.name,
            String(item.quantity),
            String(item.points),
          ])}
        />
        <CitizenTable
          title="Mes échanges"
          empty="Aucun échange confirmé sur 30 jours."
          headers={["Objet", "Nb", "USD"]}
          rows={data.rewards.map((item) => [
            item.label,
            String(item.count),
            formatUsd(item.usd),
          ])}
        />
      </div>

      <CitizenTable
        title="Dernières opérations"
        empty="Pas encore d’historique sur 30 jours."
        headers={["Opération", "Shop", "Pts"]}
        rows={data.recent.map((item) => [
          `${item.title} · ${item.status === "CONFIRMED" ? "Confirmé" : "Refusé"}`,
          item.shopName ?? "—",
          String(item.points),
        ])}
      />
    </div>
  )
}

function MiniStat({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: string
  hint?: string
  href?: string
}) {
  const body = (
    <>
      <p className="text-[11px] text-zinc-500 lg:text-xs">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 lg:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-zinc-500">{hint}</p> : null}
    </>
  )
  if (href) {
    return (
      <Link href={href} className="rounded-2xl bg-white px-3.5 py-3 lg:px-5 lg:py-4">
        {body}
      </Link>
    )
  }
  return (
    <div className="rounded-2xl bg-white px-3.5 py-3 lg:px-5 lg:py-4">{body}</div>
  )
}

function CitizenTable({
  title,
  empty,
  headers,
  rows,
}: {
  title: string
  empty: string
  headers: string[]
  rows: string[][]
}) {
  return (
    <section className="rounded-2xl bg-white px-3.5 py-3 lg:px-5 lg:py-5">
      <p className="text-sm font-semibold text-zinc-900 lg:text-base">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">{empty}</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-[11px] text-zinc-500">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={index === 0 ? "pb-2 font-medium" : "pb-2 text-right font-medium"}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("|")} className="border-t border-zinc-100">
                {row.map((cell, index) => (
                  <td
                    key={`${headers[index]}-${cell}`}
                    className={index === 0 ? "py-2" : "py-2 text-right"}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
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
