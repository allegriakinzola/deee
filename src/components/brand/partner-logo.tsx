"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

export function PartnerLogo({
  src,
  name,
  className,
  fallback = "text",
}: {
  src: string | null
  name: string
  className?: string
  fallback?: "text" | "hide"
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    if (fallback === "hide") return null
    return <span className={cn("text-sm font-medium", className)}>{name}</span>
  }

  return (
    // Le fichier peut manquer après un déploiement : on retombe sur le nom.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name ? `Logo ${name}` : ""}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
