import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { Logo } from "@/components/brand/logo"
import { SectionMesh } from "@/components/layout/section-mesh"

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="relative isolate grid min-h-full flex-1 lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/recyclagephoto.jpg"
          alt="Collecte et recyclage à Kinshasa"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-emerald-950/85 via-emerald-950/35 to-emerald-950/20" />
        <div className="absolute inset-0 bg-linear-to-br from-primary/25 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Logo className="text-white [&_span:first-child]:bg-white/20 [&_span:first-child]:text-white" />
          <div className="max-w-md">
            <p className="text-sm font-medium tracking-[0.2em] text-white/70 uppercase">
              DEEE Kinshasa
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-balance lg:text-5xl lg:leading-[1.1]">
              Gagnez des points.
              <br />
              Recyclez Kinshasa.
            </p>
            <p className="mt-5 text-base leading-relaxed text-white/75">
              Déposez vos appareils en shop, cumulez des points, et échangez-les
              contre du crédit, un produit ou un service.
            </p>
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-full flex-col bg-background">
        <SectionMesh className="opacity-70" />
        <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden lg:block" />
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Retour à l’accueil
          </Link>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-[28rem] flex-1 flex-col justify-center px-6 py-8 lg:px-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
            Compte
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </main>
      </section>
    </div>
  )
}
