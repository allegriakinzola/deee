import "server-only"

import { createSession, revokeAllSessionsForUser } from "./session-store"

export { createSession as startSessionForUser, revokeAllSessionsForUser }
