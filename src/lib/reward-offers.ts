export const REWARD_KINDS = ["FORFAIT", "PRODUIT", "SERVICE"] as const

export type RewardKind = (typeof REWARD_KINDS)[number]

export type PartnerSector = "TELECOM" | "BANK" | "PRODUCTS"

export function rewardKindLabel(kind: RewardKind): string {
  if (kind === "FORFAIT") return "Forfait"
  if (kind === "PRODUIT") return "Produit physique"
  return "Service"
}

export function rewardKindExamples(kind: RewardKind): string {
  if (kind === "FORFAIT") return "Data, appels"
  if (kind === "PRODUIT") return "T-shirt, képi, powerbank"
  return "Prestation en shop"
}

export function defaultRewardKind(kind: PartnerSector): RewardKind {
  return kind === "TELECOM" ? "FORFAIT" : "PRODUIT"
}

export function defaultOfferLabels(kind: RewardKind): string[] {
  if (kind === "FORFAIT") return ["Forfait data", "Forfait appels"]
  if (kind === "PRODUIT") return ["T-shirt", "Képi", "Powerbank"]
  return ["Service en shop"]
}
