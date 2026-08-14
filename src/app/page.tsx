import { Catalog } from "@/components/home/catalog"
import { Faq } from "@/components/home/faq"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { Partners } from "@/components/home/partners"
import { PromiseSection } from "@/components/home/promise"
import { Rewards } from "@/components/home/rewards"
import { Shops } from "@/components/home/shops"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SectionMesh } from "@/components/layout/section-mesh"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Suspense } from "react"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <PromiseSection />
        <Partners />
        <HowItWorks />
        <Catalog />
        <Rewards />
        <Suspense>
          <Shops />
        </Suspense>
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  )
}

function ClosingCta() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:py-20">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-linear-to-br from-primary/80 via-primary/45 to-secondary px-6 py-12 text-center sm:px-12">
        <SectionMesh />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Un téléphone au tiroir peut valoir des points
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Passez dans un shop, faites confirmer votre dépôt, et commencez à
            cumuler des points.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#shops"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-xl px-5 text-base"
              )}
            >
              Voir les shops
            </Link>
            <Link
              href="#catalogue"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-xl border-border bg-card px-5 text-base"
              )}
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
