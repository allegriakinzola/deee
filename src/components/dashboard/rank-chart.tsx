export function RankChart({
  items,
  empty,
  unit,
}: {
  items: Array<{ label: string; value: number; detail: string }>
  empty: string
  unit?: string
}) {
  const max = Math.max(1, ...items.map((item) => item.value))
  if (items.length === 0 || items.every((item) => item.value === 0)) {
    return <p className="text-sm text-muted-foreground">{empty}</p>
  }

  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li key={item.label}>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="w-4 shrink-0 text-xs text-muted-foreground">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
            <span className="shrink-0 text-muted-foreground">{item.detail}</span>
          </div>
          <div className="mt-1.5 ml-6 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[oklch(0.46_0.11_152)]"
              style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
            />
          </div>
          {unit ? (
            <p className="sr-only">
              {item.value} {unit}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
