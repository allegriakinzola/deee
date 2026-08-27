import { redirect } from "next/navigation"

import { PartnerShell } from "@/components/partner/partner-shell"
import { canAccessPartnerAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export default async function PartnerLayout({
  children,
}: LayoutProps<"/partenaire">) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/partenaire")
  }
  if (!canAccessPartnerAdmin(user.role, user.partnerId)) {
    redirect("/interdit")
  }

  return <PartnerShell user={user}>{children}</PartnerShell>
}
