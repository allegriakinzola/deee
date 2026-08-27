import "server-only"

import type { AuthUser } from "@/modules/auth"

import { assertCanManageUsers } from "./assert-manager"
import type { DirectoryUser } from "./contract"
import { accessFromUser, listUsersWithIdentities } from "./repository"

export async function listDirectoryUsers(
  actor: AuthUser
): Promise<DirectoryUser[]> {
  assertCanManageUsers(actor)

  const users = await listUsersWithIdentities()

  return users
    .filter((user) => user.role !== "SHOP_STAFF" && user.role !== "CITIZEN")
    .map((user) => ({
    id: user.id,
    displayName: user.displayName,
    email:
      user.identities.find((identity) => identity.type === "EMAIL")?.value ??
      null,
    role: user.role,
    status: user.status,
    access: accessFromUser(user),
    createdAt: user.createdAt.toISOString(),
  }))
}
