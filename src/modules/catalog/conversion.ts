import { parsePositiveDecimal } from "@/platform/decimal"

export const DEFAULT_USD_PER_POINT = "0.04"

export { parsePositiveDecimal }

export function pointsPerBon(
  usdPerPoint: string,
  bonUsdValue: string
): number {
  const point = Number(usdPerPoint)
  const bon = Number(bonUsdValue)
  if (!Number.isFinite(point) || !Number.isFinite(bon) || point <= 0) {
    return 0
  }
  return Math.round(bon / point)
}

export function usdFromPoints(points: number, usdPerPoint: string): string {
  const point = Number(usdPerPoint)
  if (!Number.isFinite(point) || !Number.isFinite(points)) {
    return "0.00"
  }
  return (points * point).toFixed(2)
}

export function bonsFromPoints(
  points: number,
  usdPerPoint: string,
  bonUsdValue: string
): number {
  const usd = Number(usdFromPoints(points, usdPerPoint))
  const bon = Number(bonUsdValue)
  if (!Number.isFinite(usd) || !Number.isFinite(bon) || bon <= 0) {
    return 0
  }
  return Math.floor(usd / bon)
}
