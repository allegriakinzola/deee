import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { UsersWorkspace } from "@/components/gvb/users-workspace"
import { canManageUsers } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"
import { listDirectoryUsers } from "@/modules/users"

export const metadata: Metadata = {
  title: "Utilisateurs",
  robots: { index: false, follow: false },
}

export default async function AdminUsersPage() {
  const actor = await getCurrentUser()
  if (!actor) {
    redirect("/connexion?next=/admin/utilisateurs")
  }
  if (!canManageUsers(actor.role)) {
    redirect("/interdit")
  }

  const users = await listDirectoryUsers(actor)

  return <UsersWorkspace actorId={actor.id} users={users} />
}
