import { PartnerRewardsSlider } from "@/components/home/partner-rewards-slider"
import type { PublicPartner } from "@/lib/public-directory"
import { SectionMesh } from "@/components/layout/section-mesh"

const RULES = [
  {
    title: "Dépôt confirmé",
    effect: "Points crédités sur votre compte",
  },
  {
    title: "Échange en shop",
    effect: "Points débités · récompense remise",
  },
]

export function Rewards({ partners }: { partners: PublicPartner[] }) {
  return (
    <section id="points" className="relative isolate scroll-mt-20 overflow-hidden">
      <SectionMesh />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary-foreground/80 uppercase">
            Récompenses
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Vos points, échangés en shop — pas en ligne
          </h2>
          <p className="mt-4 text-muted-foreground">
            Un télécom échange les points contre un forfait data ou appels. Les
            autres partenaires les échangent contre un goodie ou un service,
            selon les offres qu’ils ont choisies. L’échange se fait en shop,
            avec le responsable.
          </p>
          <ul className="mt-8 space-y-3">
            {RULES.map((rule) => (
              <li
                key={rule.title}
                className="flex items-baseline justify-between gap-4 border-b border-border py-3"
              >
                <span className="font-medium">{rule.title}</span>
                <span className="text-right text-sm text-muted-foreground">
                  {rule.effect}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <PartnerRewardsSlider partners={partners} />
      </div>
    </section>
  )
}
