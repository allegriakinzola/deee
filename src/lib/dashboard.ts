import { formatDayLabel, lastUtcDays } from "@/lib/period"

export type DailyBucket = {
  date: string
  confirmed: number
  points: number
}

export type DashboardDay = {
  date: string
  label: string
  deposits: number
  redeems: number
  pointsIn: number
  pointsOut: number
}

export function mergeDailySeries(
  deposits: DailyBucket[],
  redeems: DailyBucket[],
  days = 30
): DashboardDay[] {
  const depositByDay = new Map(deposits.map((item) => [item.date, item]))
  const redeemByDay = new Map(redeems.map((item) => [item.date, item]))
  return lastUtcDays(days).map((date) => ({
    date,
    label: formatDayLabel(date),
    deposits: depositByDay.get(date)?.confirmed ?? 0,
    redeems: redeemByDay.get(date)?.confirmed ?? 0,
    pointsIn: depositByDay.get(date)?.points ?? 0,
    pointsOut: redeemByDay.get(date)?.points ?? 0,
  }))
}

export function mergeRecent<T extends { at: string }>(
  items: T[],
  limit = 8
): T[] {
  return [...items].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit)
}
