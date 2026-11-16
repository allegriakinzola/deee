"use client"

import { useMemo, useState } from "react"

import { formatDayLabel, formatMonthLabel } from "@/lib/period"
import { cn } from "@/lib/utils"

import type { PeriodChartPoint } from "./period-chart"

const RANGES = [
  { days: 7, label: "7 jours", grain: "day" },
  { days: 30, label: "30 jours", grain: "day" },
  { days: 90, label: "3 mois", grain: "week" },
  { days: 365, label: "1 an", grain: "month" },
] as const

type Grain = (typeof RANGES)[number]["grain"]

function weekStart(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const weekday = date.getUTCDay()
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday
  date.setUTCDate(date.getUTCDate() + mondayOffset)
  return date.toISOString().slice(0, 10)
}

function bucketSeries(points: PeriodChartPoint[], grain: Grain) {
  if (grain === "day") return points
  const buckets = new Map<string, PeriodChartPoint>()
  for (const point of points) {
    const date = grain === "week" ? weekStart(point.date) : `${point.date.slice(0, 7)}-01`
    const current = buckets.get(date) ?? {
      date,
      label: grain === "week" ? formatDayLabel(date) : formatMonthLabel(date),
      deposits: 0,
      redeems: 0,
      pointsIn: 0,
      pointsOut: 0,
    }
    current.deposits += point.deposits
    current.redeems += point.redeems
    current.pointsIn = (current.pointsIn ?? 0) + (point.pointsIn ?? 0)
    current.pointsOut = (current.pointsOut ?? 0) + (point.pointsOut ?? 0)
    buckets.set(date, current)
  }
  return [...buckets.values()]
}

function grainCaption(grain: Grain) {
  const period =
    grain === "month" ? "chaque mois" : grain === "week" ? "chaque semaine" : "chaque jour"
  return `Dépôts, échanges et points ${period}`
}

const VIEW_W = 720
const VIEW_H = 260
const PAD = { l: 44, r: 52, t: 16, b: 32 }

const DEPOSIT = "oklch(0.46 0.11 152)"
const REDEEM = "oklch(0.68 0.13 78)"

function niceMax(value: number) {
  if (value <= 1) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const normalized = value / power
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * power
}

function seriesPath(points: Array<[number, number]>) {
  if (points.length === 0) return ""
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ")
}

function axisLabel(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)
}

export function ActivityChart({ points }: { points: PeriodChartPoint[] }) {
  const [days, setDays] = useState<(typeof RANGES)[number]["days"]>(365)
  const [hover, setHover] = useState<number | null>(null)
  const range = RANGES.find((item) => item.days === days) ?? RANGES[3]
  const slice = useMemo(
    () => bucketSeries(points.slice(-days), range.grain),
    [days, points, range.grain]
  )
  const innerW = VIEW_W - PAD.l - PAD.r
  const innerH = VIEW_H - PAD.t - PAD.b
  const countMax = niceMax(
    Math.max(0, ...slice.map((item) => Math.max(item.deposits, item.redeems)))
  )
  const pointsMax = niceMax(
    Math.max(
      0,
      ...slice.map((item) => Math.max(item.pointsIn ?? 0, item.pointsOut ?? 0))
    )
  )
  const baseline = PAD.t + innerH
  const yFor = (value: number, max: number) => baseline - (value / max) * innerH

  const coords = slice.map((item, index) => {
    const x =
      slice.length === 1
        ? PAD.l + innerW / 2
        : PAD.l + (index / (slice.length - 1)) * innerW
    const deposits = item.deposits
    const redeems = item.redeems
    const pointsIn = item.pointsIn ?? 0
    const pointsOut = item.pointsOut ?? 0
    return {
      x,
      deposits,
      redeems,
      pointsIn,
      pointsOut,
      depositsY: yFor(deposits, countMax),
      redeemsY: yFor(redeems, countMax),
      pointsInY: yFor(pointsIn, pointsMax),
      pointsOutY: yFor(pointsOut, pointsMax),
      item,
    }
  })
  const depositPath = seriesPath(coords.map((point) => [point.x, point.depositsY]))
  const redeemPath = seriesPath(coords.map((point) => [point.x, point.redeemsY]))
  const pointsInPath = seriesPath(coords.map((point) => [point.x, point.pointsInY]))
  const pointsOutPath = seriesPath(coords.map((point) => [point.x, point.pointsOutY]))
  const depositArea =
    coords.length > 0
      ? `${depositPath} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`
      : ""
  const redeemArea =
    coords.length > 0
      ? `${redeemPath} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`
      : ""
  const active = hover === null ? null : coords[hover]
  const labelStep = slice.length > 16 ? Math.ceil(slice.length / 8) : 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Activité confirmée</p>
          <p className="text-xs text-muted-foreground">{grainCaption(range.grain)}</p>
        </div>
        <div className="flex gap-1 rounded-full bg-muted/70 p-1">
            {RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                onClick={() => {
                  setDays(range.days)
                  setHover(null)
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  days === range.days
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {range.label}
              </button>
            ))}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-64 w-full"
          role="img"
          aria-label="Courbe des dépôts, des échanges et des points"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(event) => {
            if (slice.length === 0) return
            const rect = event.currentTarget.getBoundingClientRect()
            const x = ((event.clientX - rect.left) / rect.width) * VIEW_W
            const ratio = (x - PAD.l) / innerW
            const index = Math.round(ratio * Math.max(slice.length - 1, 0))
            setHover(Math.min(slice.length - 1, Math.max(0, index)))
          }}
        >
          {[0, 0.5, 1].map((step) => {
            const y = baseline - step * innerH
            const value = Math.round(countMax * step)
            return (
              <g key={step}>
                <line
                  x1={PAD.l}
                  x2={VIEW_W - PAD.r}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="1"
                />
                <text
                  x={PAD.l - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground"
                  fontSize="11"
                >
                  {axisLabel(value)}
                </text>
                <text
                  x={VIEW_W - PAD.r + 8}
                  y={y + 4}
                  textAnchor="start"
                  className="fill-muted-foreground"
                  fontSize="11"
                >
                  {axisLabel(Math.round(pointsMax * step))}
                </text>
              </g>
            )
          })}
          <path d={depositArea} fill={DEPOSIT} opacity="0.12" />
          <path d={redeemArea} fill={REDEEM} opacity="0.12" />
          <path d={depositPath} fill="none" stroke={DEPOSIT} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={redeemPath} fill="none" stroke={REDEEM} strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d={pointsInPath}
            fill="none"
            stroke={DEPOSIT}
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />
          <path
            d={pointsOutPath}
            fill="none"
            stroke={REDEEM}
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />
          {coords.map((point) => (
            <g key={point.item.date}>
              {point.deposits > 0 ? (
                <circle cx={point.x} cy={point.depositsY} r="2.5" fill={DEPOSIT} />
              ) : null}
              {point.redeems > 0 ? (
                <circle cx={point.x} cy={point.redeemsY} r="2.5" fill={REDEEM} />
              ) : null}
              {point.pointsIn > 0 ? (
                <circle cx={point.x} cy={point.pointsInY} r="2.5" fill={DEPOSIT} />
              ) : null}
              {point.pointsOut > 0 ? (
                <circle cx={point.x} cy={point.pointsOutY} r="2.5" fill={REDEEM} />
              ) : null}
            </g>
          ))}
          {coords.map((point, index) =>
            index % labelStep === 0 || index === coords.length - 1 ? (
              <text
                key={point.item.date}
                x={point.x}
                y={VIEW_H - 8}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="11"
              >
                {point.item.label}
              </text>
            ) : null
          )}
          {active ? (
            <g>
              <line
                x1={active.x}
                x2={active.x}
                y1={PAD.t}
                y2={baseline}
                stroke="currentColor"
                className="text-foreground/25"
                strokeDasharray="3 3"
              />
              <circle cx={active.x} cy={active.depositsY} r="4" fill={DEPOSIT} />
              <circle cx={active.x} cy={active.redeemsY} r="4" fill={REDEEM} />
              <circle cx={active.x} cy={active.pointsInY} r="4" fill={DEPOSIT} />
              <circle cx={active.x} cy={active.pointsOutY} r="4" fill={REDEEM} />
            </g>
          ) : null}
        </svg>
        {active ? (
          <div
            className="pointer-events-none absolute top-2 rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-md"
            style={{
              left: `${(active.x / VIEW_W) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-medium">{active.item.label}</p>
            <p>Dépôts : {active.deposits}</p>
            <p>Échanges : {active.redeems}</p>
            <p>Points crédités : {active.pointsIn}</p>
            <p>Points remis : {active.pointsOut}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="16" y2="4" stroke={DEPOSIT} strokeWidth="2.5" />
          </svg>
          Dépôts
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="16" y2="4" stroke={REDEEM} strokeWidth="2.5" />
          </svg>
          Échanges
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="16" y2="4" stroke={DEPOSIT} strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          Points crédités
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="16" y2="4" stroke={REDEEM} strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          Points remis
        </span>
        <span>Gauche : nombre d’opérations. Droite : points.</span>
      </div>
    </div>
  )
}
