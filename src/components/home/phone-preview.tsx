import {
  BellIcon,
  HouseIcon,
  MapPinIcon,
  PlugIcon,
  QrCodeIcon,
  RecycleIcon,
  SmartphoneIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react"

import { IphoneFrame, IphoneStatusBar } from "@/components/brand/iphone-frame"

export function PhonePreview() {
  return (
    <IphoneFrame label="Aperçu de l’application DEEE Kinshasa">
      <div className="flex h-full flex-col px-3 pb-1.5 pt-9">
        <IphoneStatusBar />

        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500">Mbote, Joseph</p>
            <p className="text-[13px] font-semibold tracking-tight text-zinc-900">
              DEEE Kinshasa
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex size-7 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200">
              <BellIcon className="size-3.5" />
              <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-emerald-600" />
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200">
              <UserIcon className="size-3.5" />
            </span>
          </div>
        </div>

        <div className="mt-2.5 rounded-2xl bg-primary px-3 py-3 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-medium tracking-wide uppercase">
                Mon solde
              </p>
              <p className="mt-0.5 text-[28px] font-semibold leading-none tracking-tight">
                180
                <span className="ml-1 text-[12px] font-medium opacity-80">
                  pts
                </span>
              </p>
            </div>
            <span className="rounded-full bg-white/35 px-2 py-0.5 text-[9px] font-semibold">
              Seuil 50 pts
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/35">
            <div className="h-full w-[72%] rounded-full bg-white" />
          </div>
          <p className="mt-1.5 text-[9px] opacity-80">
            20 pts avant le prochain crédit Vodacom
          </p>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1.5">
          <QuickAction icon={QrCodeIcon} label="Déposer" />
          <QuickAction icon={MapPinIcon} label="Shops" />
          <QuickAction icon={SmartphoneIcon} label="Catalogue" />
          <QuickAction icon={SparklesIcon} label="Échanger" />
        </div>

        <div className="mt-2 rounded-2xl bg-white px-2.5 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-zinc-900">
              Dernier dépôt
            </p>
            <p className="text-[9px] font-medium text-emerald-800">Voir tout</p>
          </div>
          <DepositRow
            icon={SmartphoneIcon}
            title="Smartphone"
            meta="Vodacom Gombe · confirmé"
            points="+80"
          />
          <div className="my-1.5 h-px bg-zinc-100" />
          <DepositRow
            icon={PlugIcon}
            title="Chargeur"
            meta="Vodacom Gombe · confirmé"
            points="+20"
          />
          <div className="my-1.5 h-px bg-zinc-100" />
          <DepositRow
            icon={RecycleIcon}
            title="Batterie"
            meta="Vodacom Limete · confirmé"
            points="+40"
          />
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-2.5 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/50 text-primary-foreground">
            <MapPinIcon className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium leading-tight text-zinc-900">
              Shop le plus proche
            </p>
            <p className="truncate text-[9px] text-zinc-500">
              Vodacom Gombe · 1,2 km · ouvert
            </p>
          </div>
          <span className="text-[9px] font-semibold text-emerald-800">
            Y aller
          </span>
        </div>

        <div className="mt-auto grid grid-cols-4 border-t border-zinc-200/80 bg-white pt-1.5 pb-1">
          <Tab icon={HouseIcon} label="Accueil" active />
          <Tab icon={RecycleIcon} label="Dépôt" />
          <Tab icon={MapPinIcon} label="Shops" />
          <Tab icon={UserIcon} label="Compte" />
          <div className="col-span-4 mx-auto mt-1 h-[4px] w-[92px] rounded-full bg-zinc-900" />
        </div>
      </div>
    </IphoneFrame>
  )
}

function QuickAction({
  icon: Icon,
  label,
}: {
  icon: typeof QrCodeIcon
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white py-2">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/50 text-primary-foreground">
        <Icon className="size-3.5" />
      </span>
      <span className="text-[8px] font-medium text-zinc-600">{label}</span>
    </div>
  )
}

function DepositRow({
  icon: Icon,
  title,
  meta,
  points,
}: {
  icon: typeof SmartphoneIcon
  title: string
  meta: string
  points: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/50 text-primary-foreground">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium leading-tight text-zinc-900">
          {title}
        </p>
        <p className="truncate text-[8px] text-zinc-500">{meta}</p>
      </div>
      <p className="text-[11px] font-semibold text-emerald-800">{points}</p>
    </div>
  )
}

function Tab({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof HouseIcon
  label: string
  active?: boolean
}) {
  return (
    <div className={active ? "text-emerald-800" : "text-zinc-400"}>
      <Icon className="mx-auto size-3.5" />
      <p className="mt-0.5 text-center text-[8px] font-medium">{label}</p>
    </div>
  )
}
