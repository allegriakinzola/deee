import { z } from "zod"

/** Kinshasa, avec une marge pour les 24 communes. */
const KINSHASA = {
  latMin: -4.6,
  latMax: -4.2,
  lngMin: 15.05,
  lngMax: 15.65,
}

function decimalInput(value: unknown): unknown {
  if (typeof value !== "string") return value
  const trimmed = value.trim().replace(/\s/g, "")
  if (!trimmed) return value
  return trimmed.includes(".")
    ? trimmed.replace(/,/g, "")
    : trimmed.replace(",", ".")
}

const latitude = z.preprocess(
  decimalInput,
  z.coerce.number().gte(KINSHASA.latMin).lte(KINSHASA.latMax)
)
const longitude = z.preprocess(
  decimalInput,
  z.coerce.number().gte(KINSHASA.lngMin).lte(KINSHASA.lngMax)
)

export const kinshasaPositionSchema = z.object({
  lat: latitude,
  lng: longitude,
})

export const KINSHASA_POSITION_ERROR =
  "La position doit être à Kinshasa. Exemple : -4,305 et 15,313."
