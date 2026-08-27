import { redirect } from "next/navigation"

import { GvbShell } from "@/components/gvb/gvb-shell"
import { canAccessGvbAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/admin")
  }
  if (!canAccessGvbAdmin(user.role)) {
    redirect("/interdit")
  }

  return <GvbShell user={user}>{children}</GvbShell>
}
