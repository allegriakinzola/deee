export function daysAgoUtc(days: number): Date {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days)
  )
}

export function lastUtcDays(count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = daysAgoUtc(count - 1 - index)
    return date.toISOString().slice(0, 10)
  })
}

export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function formatDayLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function formatLongDateUtc(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function formatDateTimeKinshasa(date: Date): string {
  return date.toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Kinshasa",
  })
}
