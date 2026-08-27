function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

export function PartnerMark({
  name,
  logo,
  size = "md",
}: {
  name: string
  logo: string | null
  size?: "sm" | "md"
}) {
  const box = size === "sm" ? "size-8" : "size-9"

  if (logo) {
    return (
      // Logos partenaires déjà dans /public
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt=""
        className={`${box} shrink-0 rounded-full bg-white object-contain ring-1 ring-foreground/10`}
      />
    )
  }

  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-primary/40 text-xs font-semibold`}
      aria-hidden="true"
    >
      {initials(name) || "?"}
    </span>
  )
}
