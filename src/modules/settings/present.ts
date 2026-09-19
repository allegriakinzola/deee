import type { OperatorSettings } from "./contract"

export function toOperatorSettings(row: {
  bonUsdValue: { toString(): string }
  updatedAt: Date
}): OperatorSettings {
  return {
    bonUsdValue: row.bonUsdValue.toString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
