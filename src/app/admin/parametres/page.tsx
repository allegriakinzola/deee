import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { BonSettingsForm } from "@/components/gvb/bon-settings-form"
import { SettingsShell } from "@/components/gvb/settings-shell"
import { canManageSettings } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { getOperatorSettings } from "@/modules/settings"

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
}

export default async function AdminSettingsPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/admin/parametres")
  }
  if (!canManageSettings(actor.role)) {
    redirect("/interdit")
  }

  const settings = await getOperatorSettings(actor)

  return (
    <SettingsShell>
      <BonSettingsForm settings={settings} />
    </SettingsShell>
  )
}
