import { CheckIcon, RecycleIcon, SparklesIcon } from "lucide-react"

import { SectionHeading } from "@/components/layout/section-heading"
import { SectionMesh } from "@/components/layout/section-mesh"

const STEPS = [
  {
    n: "01",
    title: "Choisissez vos appareils",
    text: "Consultez le catalogue, choisissez vos articles, puis rendez-vous dans un shop.",
    icon: RecycleIcon,
  },
  {
    n: "02",
    title: "Validez en shop",
    text: "Le responsable vérifie les pièces et confirme le dépôt. Les points sont crédités à ce moment-là.",
    icon: CheckIcon,
  },
  {
    n: "03",
    title: "Échangez vos points",
    text: "Crédit, produit ou service : l’échange se fait en shop, avec le responsable.",
    icon: SparklesIcon,
  },
]

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="relative isolate scroll-mt-20 overflow-hidden bg-card">
      <SectionMesh />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="Parcours"
          title="Simple comme 1, 2, 3"
          description="Déposez vos appareils, validez en shop, puis échangez vos points contre une récompense."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="relative overflow-hidden rounded-3xl border border-border bg-background p-6"
            >
              <span className="absolute -right-1 -top-3 text-7xl font-semibold tracking-tight text-primary/35">
                {step.n}
              </span>
              <span className="relative flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <step.icon className="size-4" />
              </span>
              <h3 className="relative mt-8 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
