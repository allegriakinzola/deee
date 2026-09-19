import "server-only"

import { prisma } from "@/platform/db"

import { DEFAULT_BON_USD, OPERATOR_SETTINGS_ID } from "./defaults"

export async function getOrCreateOperatorSettings() {
  const existing = await prisma.operatorSettings.findUnique({
    where: { id: OPERATOR_SETTINGS_ID },
  })
  if (existing) {
    return existing
  }

  return prisma.operatorSettings.create({
    data: {
      id: OPERATOR_SETTINGS_ID,
      bonUsdValue: DEFAULT_BON_USD,
    },
  })
}

export async function updateOperatorSettingsRecord(bonUsdValue: string) {
  return prisma.operatorSettings.upsert({
    where: { id: OPERATOR_SETTINGS_ID },
    create: {
      id: OPERATOR_SETTINGS_ID,
      bonUsdValue,
    },
    update: { bonUsdValue },
  })
}
