export type PublicPartner = {
  id: string
  name: string
  shortName: string
  logo: string | null
  kind: "TELECOM" | "BANK" | "PRODUCTS"
  rewardKind: "FORFAIT" | "PRODUIT" | "SERVICE"
}

export type PublicShop = {
  id: string
  partnerId: string
  partnerName: string
  name: string
  area: string
  lat: number
  lng: number
}

export const KINSHASA_CENTER = { lat: -4.335, lng: 15.305 }

export function rewardCopy(partner: PublicPartner) {
  if (partner.rewardKind === "FORFAIT") {
    return {
      title: "Forfait data ou appels",
      detail:
        "Les points s’échangent en shop contre un forfait data ou un forfait appels. Le responsable confirme, puis remet la récompense.",
    }
  }
  if (partner.rewardKind === "SERVICE") {
    return {
      title: "Service en shop",
      detail:
        "Les points s’échangent contre un service de ce partenaire. Le responsable confirme, puis remet la prestation.",
    }
  }
  return {
    title: "Goodies",
    detail:
      "Les points s’échangent contre un t-shirt, un képi, une powerbank ou un autre objet de ce partenaire.",
  }
}
