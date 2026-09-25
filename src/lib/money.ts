export function usdFromPoints(points: number, usdPerPoint: string): string {
  const rate = Number(usdPerPoint)
  if (!Number.isFinite(rate) || !Number.isFinite(points)) {
    return "0.00"
  }
  return (points * rate).toFixed(2)
}

export function formatUsd(amount: string): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) {
    return "0,00 $"
  }
  return `${value.toFixed(2).replace(".", ",")} $`
}

export function formatPointsAndUsd(
  points: number,
  usdPerPoint: string
): string {
  return `${points} pts · ${formatUsd(usdFromPoints(points, usdPerPoint))}`
}
