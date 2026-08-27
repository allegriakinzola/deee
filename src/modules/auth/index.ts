/**
 * Auth — mot de passe, session cookie, login / logout.
 * Les pages et les routes n’appellent que ce fichier.
 * Les Client Components : `import type` uniquement.
 */
export { loginWithPassword } from "./login"
export { logoutCurrentSession } from "./logout"
export { getCurrentUser } from "./get-current-user"
export { requireActor } from "./require-actor"
export { startSessionForUser, revokeAllSessionsForUser } from "./sessions"
export { writeSessionCookie } from "./session-cookie"
export type { AuthUser } from "./types"
