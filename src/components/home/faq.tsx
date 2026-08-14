import Image from "next/image"

import { SectionMesh } from "@/components/layout/section-mesh"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/lib/faq"

export function Faq() {
  return (
    <section id="faq" className="relative isolate scroll-mt-20 overflow-hidden">
      <SectionMesh />
      <div className="relative mx-auto grid w-full max-w-6xl items-start gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-20">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary-foreground/80 uppercase">
            Questions
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            L’essentiel avant de déposer
          </h2>
          <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-3xl">
            <Image
              src="/imagesection.jpg"
              alt="Collecte d’équipements électriques et électroniques à recycler"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </div>
        <Accordion className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
