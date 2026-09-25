import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AdminDashboardView } from "@/components/gvb/admin-dashboard"
import { canAccessGvbAdmin } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { getAdminDashboard } from "@/modules/users"

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/admin")
  }
  if (!canAccessGvbAdmin(user.role)) {
    redirect("/interdit")
  }

  const data = await getAdminDashboard(user)

  return (
    <AdminDashboardView displayName={user.displayName} data={data} />
  )
}
