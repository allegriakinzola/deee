import Image from "next/image"
import Link from "next/link"

import { PARTNERS } from "@/lib/shops"

const LOOP = [...PARTNERS, ...PARTNERS]

export function Partners() {
  return (
    <section
      id="partenaires"
      className="scroll-mt-20 border-y border-border bg-card"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-center text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Ils nous accompagnent
        </p>

        <div className="partner-marquee-wrap mt-8">
          <ul className="partner-marquee">
            {LOOP.map((partner, index) => (
              <li key={`${partner.id}-${index}`} className="shrink-0">
                <Link
                  href={`/?partenaire=${partner.id}#shops`}
                  className="flex h-12 items-center justify-center px-6 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-14 sm:px-8"
                >
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    width={140}
                    height={48}
                    className="max-h-8 w-auto object-contain sm:max-h-9"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
