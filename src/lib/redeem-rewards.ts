export type RewardPartnerKind = "TELECOM" | "BANK" | "PRODUCTS"

export type RedeemReward = {
  id: string
  partnerKind: RewardPartnerKind
  label: string
  usd: number
}

export const REDEEM_REWARDS: RedeemReward[] = [
  {
    id: "telecom-giga",
    partnerKind: "TELECOM",
    label: "Achat giga 10 dollars",
    usd: 10,
  },
  {
    id: "telecom-credit",
    partnerKind: "TELECOM",
    label: "Achat crédit 10 dollars",
    usd: 10,
  },
  {
    id: "telecom-forfait",
    partnerKind: "TELECOM",
    label: "Achat forfait 10 dollars",
    usd: 10,
  },
  {
    id: "bank-visa",
    partnerKind: "BANK",
    label: "Achat carte visa 10 dollars",
    usd: 10,
  },
  {
    id: "products-item",
    partnerKind: "PRODUCTS",
    label: "Achat produit 10 dollars",
    usd: 10,
  },
]

export function rewardsForKind(kind: RewardPartnerKind): RedeemReward[] {
  return REDEEM_REWARDS.filter((item) => item.partnerKind === kind)
}

export function findReward(id: string): RedeemReward | null {
  return REDEEM_REWARDS.find((item) => item.id === id) ?? null
}

export function kindLabel(kind: RewardPartnerKind): string {
  if (kind === "TELECOM") return "Télécom"
  if (kind === "BANK") return "Banque"
  return "Produits"
}
