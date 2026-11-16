import type { ReactNode } from "react"

import { SettingsNav } from "@/components/gvb/settings-nav"

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 w-full space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-800/75 uppercase">
          Opérateur
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Paramètres
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Ces réglages s’appliquent à tous les shops et à tous les citoyens.
        </p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-0">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Réglages
          </p>
          <SettingsNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
