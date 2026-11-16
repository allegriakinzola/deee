const COLORS = [
  "oklch(0.46 0.11 152)",
  "oklch(0.68 0.13 78)",
  "oklch(0.55 0.08 210)",
  "oklch(0.58 0.09 40)",
  "oklch(0.4 0.04 152)",
  "oklch(0.72 0.06 152)",
]

export function ShareChart({
  items,
  empty,
  center,
}: {
  items: Array<{ label: string; value: number }>
  empty: string
  center: string
}) {
  const shown = items.filter((item) => item.value > 0)
  const total = shown.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>
  }

  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <svg viewBox="0 0 120 120" className="size-36 shrink-0" role="img" aria-label={center}>
        <circle cx="60" cy="60" r={radius} fill="none" className="stroke-muted" strokeWidth="14" />
        {shown.map((item, index) => {
          const length = (item.value / total) * circumference
          const dash = `${length} ${circumference - length}`
          const element = (
            <circle
              key={item.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          )
          offset += length
          return element
        })}
        <text
          x="60"
          y="58"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="16"
          fontWeight="600"
        >
          {total}
        </text>
        <text
          x="60"
          y="74"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="9"
        >
          {center}
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {shown.map((item, index) => (
          <li key={item.label} className="flex items-center justify-between gap-3">
            <span className="inline-flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="shrink-0 text-muted-foreground">
              {item.value}
              <span className="ml-1 text-xs">
                {Math.round((item.value / total) * 100)} %
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
