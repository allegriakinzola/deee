import { cn } from "@/lib/utils"

export function SectionMesh({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "section-mesh pointer-events-none absolute inset-0",
        className
      )}
    />
  )
}
