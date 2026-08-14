import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string
  title: string
  description?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
