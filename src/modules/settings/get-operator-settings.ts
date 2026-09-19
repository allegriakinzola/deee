import "server-only"

import type { AuthUser } from "@/modules/auth"

import { assertCanManageSettings } from "./assert-manager"
import type { OperatorSettings } from "./contract"
import { toOperatorSettings } from "./present"
import { getOrCreateOperatorSettings } from "./repository"

export async function getOperatorSettings(
  actor: AuthUser
): Promise<OperatorSettings> {
  assertCanManageSettings(actor)
  const settings = await getOrCreateOperatorSettings()
  return toOperatorSettings(settings)
}
