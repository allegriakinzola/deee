import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function CitizenPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function CitizenSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/90",
        className
      )}
    >
      <header className="border-b border-zinc-200/80 bg-zinc-50/90 px-5 py-4 sm:px-6">
        {eyebrow ? (
          <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-800 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-950 sm:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        ) : null}
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  )
}
