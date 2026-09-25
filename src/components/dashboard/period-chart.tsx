"use client"

import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

export type PeriodChartPoint = {
  date: string
  label: string
  deposits: number
  redeems: number
}

const RANGES = [
  { days: 7, label: "7 jours" },
  { days: 14, label: "14 jours" },
  { days: 30, label: "30 jours" },
] as const

export function PeriodChart({
  points,
}: {
  points: PeriodChartPoint[]
}) {
  const [days, setDays] = useState<(typeof RANGES)[number]["days"]>(14)
  const slice = useMemo(() => points.slice(-days), [days, points])
  const max = Math.max(
    1,
    ...slice.map((item) => Math.max(item.deposits, item.redeems))
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Activité confirmée</p>
          <p className="text-xs text-muted-foreground">
            Dépôts et échanges validés, par jour
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-muted/70 p-1">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => setDays(range.days)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                days === range.days
                  ? "bg-background text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-1.5 sm:gap-2">
        {slice.map((item) => (
          <div
            key={item.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div className="flex h-36 w-full items-end justify-center gap-0.5">
              <span
                className="w-1.5 rounded-t bg-primary sm:w-2"
                style={{ height: `${(item.deposits / max) * 100}%` }}
                title={`${item.label} · ${item.deposits} dépôt${item.deposits === 1 ? "" : "s"}`}
              />
              <span
                className="w-1.5 rounded-t bg-zinc-400 sm:w-2"
                style={{ height: `${(item.redeems / max) * 100}%` }}
                title={`${item.label} · ${item.redeems} échange${item.redeems === 1 ? "" : "s"}`}
              />
            </div>
            <span className="truncate text-[10px] text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-primary" />
          Dépôts confirmés
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-zinc-400" />
          Échanges confirmés
        </span>
      </div>
    </div>
  )
}
