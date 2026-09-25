import Link from "next/link"

export function DashboardStat({
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
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10"
      >
        {body}
      </Link>
    )
  }

  return (
    <div className="rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10">
      {body}
    </div>
  )
}
