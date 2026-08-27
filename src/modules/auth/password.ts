import "server-only"

import { comparePassword, hashPassword } from "@/platform/password"

export { hashPassword }

/** Hash fixe, uniquement pour égaliser le temps si le compte n’existe pas. */
const DUMMY_HASH =
  "$2b$12$KDlBggMVsDMi2Lp.TQdCneHgh9q2gvV0pBzEg/oOKDWVUVS2SLZ8m"

export async function verifyPassword(
  password: string,
  passwordHash: string | null
): Promise<boolean> {
  return comparePassword(password, passwordHash ?? DUMMY_HASH)
}
