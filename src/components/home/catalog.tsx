import {
  BatteryChargingIcon,
  CpuIcon,
  HeadphonesIcon,
  LaptopIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react"

const CATEGORIES = [
  {
    title: "Smartphones",
    hint: "Téléphonie & tablettes",
    icon: SmartphoneIcon,
  },
  {
    title: "Tablettes",
    hint: "Téléphonie & tablettes",
    icon: TabletIcon,
  },
  {
    title: "Ordinateurs",
    hint: "Informatique",
    icon: LaptopIcon,
  },
  {
    title: "Batteries",
    hint: "Téléphonie",
    icon: BatteryChargingIcon,
  },
  {
    title: "Cartes mères",
    hint: "Composants",
    icon: CpuIcon,
  },
  {
    title: "Chargeurs & accessoires",
    hint: "Périphériques",
    icon: HeadphonesIcon,
  },
]

export function Catalog() {
  return (
    <section id="catalogue" className="scroll-mt-20 bg-linear-to-b from-primary/25 via-secondary/80 to-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-primary-foreground/80 uppercase">
              Catalogue
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Toutes les catégories acceptées
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Chaque appareil a un nombre de points fixe. Consultez le
              catalogue, puis déposez en shop.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((item) => (
            <article
              key={item.title}
              className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary-foreground">
                <item.icon className="size-4" />
              </span>
              <div>
                <h3 className="font-medium tracking-tight">{item.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.hint}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
