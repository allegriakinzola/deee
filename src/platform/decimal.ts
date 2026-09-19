export function parsePositiveDecimal(
  value: unknown,
  maxDecimals: number
): string | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null
    }
    return value.toFixed(maxDecimals)
  }

  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim().replace(",", ".")
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null
  }

  const amount = Number(trimmed)
  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  const decimals = trimmed.includes(".") ? trimmed.split(".")[1].length : 0
  if (decimals > maxDecimals) {
    return null
  }

  return amount.toFixed(maxDecimals)
}
