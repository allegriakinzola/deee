import "server-only"

import { getOrCreateOperatorSettings } from "./repository"

export async function readBonUsdValue(): Promise<string> {
  const settings = await getOrCreateOperatorSettings()
  return settings.bonUsdValue.toString()
}
