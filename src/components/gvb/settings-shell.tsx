import type { ReactNode } from "react"

import { SettingsNav } from "@/components/gvb/settings-nav"
import { Separator } from "@/components/ui/separator"

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Opérateur
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Paramètres
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Les réglages s’appliquent à toute la plateforme. D’autres
          configurations s’ajouteront ici.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="lg:w-52">
          <SettingsNav />
        </aside>
        <div className="min-w-0 flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}
