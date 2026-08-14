import Image from "next/image"

import { SectionMesh } from "@/components/layout/section-mesh"

export function PromiseSection() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border bg-linear-to-br from-primary/75 via-primary/40 to-secondary">
      <SectionMesh />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary-foreground/80 uppercase">
            Le principe
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            Gagnez des points.
            <br />
            Recyclez Kinshasa.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Chaque appareil déposé en shop vous rapporte des points, à échanger
            contre du crédit, un produit ou une récompense. Kinshasa y gagne un
            recyclage plus propre.
          </p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[5/4]">
          <Image
            src="/recyclagephoto.jpg"
            alt="Collecte et recyclage d’équipements électriques et électroniques à Kinshasa"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  )
}
