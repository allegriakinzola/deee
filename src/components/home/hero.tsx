import Link from "next/link"

import { PhonePreview } from "@/components/home/phone-preview"
import { SectionMesh } from "@/components/layout/section-mesh"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function SpiderWeb({
  cx,
  cy,
  spokes,
  radii,
}: {
  cx: number
  cy: number
  spokes: number
  radii: number[]
}) {
  const outer = radii[radii.length - 1]

  return (
    <>
      {Array.from({ length: spokes }, (_, i) => {
        const angle = (i / spokes) * Math.PI * 2 - Math.PI / 2
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * outer}
            y2={cy + Math.sin(angle) * outer}
            strokeWidth="1"
          />
        )
      })}
      {radii.map((radius, ring) => {
        const points = Array.from({ length: spokes }, (_, i) => {
          const angle = (i / spokes) * Math.PI * 2 - Math.PI / 2
          const wobble = Math.sin(i * 2.15 + ring * 0.7) * radius * 0.045
          const r = radius + wobble
          return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`
        }).join(" ")

        return (
          <polygon
            key={`ring-${ring}`}
            points={points}
            strokeWidth={ring === 0 ? "1.25" : "1"}
          />
        )
      })}
    </>
  )
}

export function Hero() {
  return (
    <section className="relative isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 right-[-6%] h-[28rem] w-[28rem] rounded-full bg-primary/55 blur-3xl" />
        <div className="absolute top-40 right-[18%] h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -left-16 top-28 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
        <SectionMesh />
        <svg
          className="hero-web absolute inset-0 h-full w-full"
          viewBox="0 0 1440 820"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <SpiderWeb
            cx={1080}
            cy={210}
            spokes={16}
            radii={[70, 140, 220, 310, 415, 540, 690]}
          />
          <SpiderWeb
            cx={80}
            cy={720}
            spokes={12}
            radii={[50, 110, 185, 275, 380]}
          />
        </svg>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <Badge
            variant="secondary"
            className="h-auto min-h-7 max-w-full whitespace-normal rounded-full border border-primary/40 bg-primary/35 px-3 py-1 text-[13px] font-medium text-primary-foreground"
          >
            Déchets d’équipements électriques et électroniques
          </Badge>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.35rem] lg:leading-[1.1]">
            Déposez vos déchets d’équipements électriques et électroniques.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Téléphones, batteries, chargeurs, tablettes : ce sont des déchets
            d’équipements électriques et électroniques. Déposez-les dans un
            shop près de chez vous.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/connexion"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-xl px-5 text-base"
              )}
            >
              Déposer un appareil
            </Link>
            <Link
              href="/connexion"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-xl px-5 text-base"
              )}
            >
              Connexion
            </Link>
          </div>
        </div>

        <div className="flex justify-center py-4 lg:justify-end lg:pr-2">
          <PhonePreview />
        </div>
      </div>
    </section>
  )
}
