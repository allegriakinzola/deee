export type PartnerId =
  | "vodacom"
  | "airtel"
  | "orange"
  | "equity"
  | "rawbank"
  | "bracongo"

export type PartnerKind = "telecom" | "bank" | "products"

export type Partner = {
  id: PartnerId
  name: string
  shortName: string
  logo: string
  kind: PartnerKind
}

export type Shop = {
  id: string
  partnerId: PartnerId
  name: string
  area: string
  lat: number
  lng: number
}

export const PARTNERS: Partner[] = [
  {
    id: "vodacom",
    name: "Vodacom",
    shortName: "Vodacom",
    logo: "/vodacomlogo.jpg",
    kind: "telecom",
  },
  {
    id: "airtel",
    name: "Airtel",
    shortName: "Airtel",
    logo: "/airtellogo.png",
    kind: "telecom",
  },
  {
    id: "orange",
    name: "Orange",
    shortName: "Orange",
    logo: "/orangelogo.jpg",
    kind: "telecom",
  },
  {
    id: "equity",
    name: "Equity BCDC",
    shortName: "Equity",
    logo: "/equitylogo.png",
    kind: "bank",
  },
  {
    id: "rawbank",
    name: "Rawbank",
    shortName: "Rawbank",
    logo: "/rawbanklogo.png",
    kind: "bank",
  },
  {
    id: "bracongo",
    name: "Bracongo",
    shortName: "Bracongo",
    logo: "/bracongologo.png",
    kind: "products",
  },
]

export const SHOPS: Shop[] = [
  {
    id: "vodacom-gombe",
    partnerId: "vodacom",
    name: "Vodacom Gombe",
    area: "Gombe",
    lat: -4.3055,
    lng: 15.313,
  },
  {
    id: "vodacom-limete",
    partnerId: "vodacom",
    name: "Vodacom Limete",
    area: "Limete",
    lat: -4.391,
    lng: 15.348,
  },
  {
    id: "vodacom-ngaliema",
    partnerId: "vodacom",
    name: "Vodacom Ngaliema",
    area: "Ngaliema",
    lat: -4.349,
    lng: 15.255,
  },
  {
    id: "vodacom-kintambo",
    partnerId: "vodacom",
    name: "Vodacom Kintambo",
    area: "Kintambo",
    lat: -4.327,
    lng: 15.272,
  },
  {
    id: "vodacom-bandalungwa",
    partnerId: "vodacom",
    name: "Vodacom Bandalungwa",
    area: "Bandalungwa",
    lat: -4.361,
    lng: 15.298,
  },
  {
    id: "airtel-gombe",
    partnerId: "airtel",
    name: "Airtel Gombe",
    area: "Gombe",
    lat: -4.303,
    lng: 15.316,
  },
  {
    id: "airtel-limete",
    partnerId: "airtel",
    name: "Airtel Limete",
    area: "Limete",
    lat: -4.388,
    lng: 15.352,
  },
  {
    id: "airtel-ngaliema",
    partnerId: "airtel",
    name: "Airtel Ngaliema",
    area: "Ngaliema",
    lat: -4.351,
    lng: 15.258,
  },
  {
    id: "airtel-kintambo",
    partnerId: "airtel",
    name: "Airtel Kintambo",
    area: "Kintambo",
    lat: -4.33,
    lng: 15.275,
  },
  {
    id: "airtel-masina",
    partnerId: "airtel",
    name: "Airtel Masina",
    area: "Masina",
    lat: -4.38,
    lng: 15.385,
  },
  {
    id: "orange-gombe",
    partnerId: "orange",
    name: "Orange Gombe",
    area: "Gombe",
    lat: -4.307,
    lng: 15.31,
  },
  {
    id: "orange-limete",
    partnerId: "orange",
    name: "Orange Limete",
    area: "Limete",
    lat: -4.394,
    lng: 15.345,
  },
  {
    id: "orange-ngaliema",
    partnerId: "orange",
    name: "Orange Ngaliema",
    area: "Ngaliema",
    lat: -4.347,
    lng: 15.252,
  },
  {
    id: "orange-lemba",
    partnerId: "orange",
    name: "Orange Lemba",
    area: "Lemba",
    lat: -4.402,
    lng: 15.314,
  },
  {
    id: "orange-bandalungwa",
    partnerId: "orange",
    name: "Orange Bandalungwa",
    area: "Bandalungwa",
    lat: -4.365,
    lng: 15.295,
  },
  {
    id: "equity-gombe",
    partnerId: "equity",
    name: "Equity BCDC Gombe",
    area: "Gombe",
    lat: -4.3085,
    lng: 15.318,
  },
  {
    id: "equity-limete",
    partnerId: "equity",
    name: "Equity BCDC Limete",
    area: "Limete",
    lat: -4.385,
    lng: 15.341,
  },
  {
    id: "equity-ngaliema",
    partnerId: "equity",
    name: "Equity BCDC Ngaliema",
    area: "Ngaliema",
    lat: -4.355,
    lng: 15.248,
  },
  {
    id: "equity-masina",
    partnerId: "equity",
    name: "Equity BCDC Masina",
    area: "Masina",
    lat: -4.385,
    lng: 15.39,
  },
  {
    id: "equity-kalamu",
    partnerId: "equity",
    name: "Equity BCDC Kalamu",
    area: "Kalamu",
    lat: -4.338,
    lng: 15.308,
  },
  {
    id: "rawbank-gombe",
    partnerId: "rawbank",
    name: "Rawbank Gombe",
    area: "Gombe",
    lat: -4.306,
    lng: 15.32,
  },
  {
    id: "rawbank-limete",
    partnerId: "rawbank",
    name: "Rawbank Limete",
    area: "Limete",
    lat: -4.387,
    lng: 15.338,
  },
  {
    id: "rawbank-ngaliema",
    partnerId: "rawbank",
    name: "Rawbank Ngaliema",
    area: "Ngaliema",
    lat: -4.353,
    lng: 15.245,
  },
  {
    id: "rawbank-kalamu",
    partnerId: "rawbank",
    name: "Rawbank Kalamu",
    area: "Kalamu",
    lat: -4.34,
    lng: 15.311,
  },
  {
    id: "rawbank-masina",
    partnerId: "rawbank",
    name: "Rawbank Masina",
    area: "Masina",
    lat: -4.382,
    lng: 15.393,
  },
  {
    id: "bracongo-limete",
    partnerId: "bracongo",
    name: "Bracongo Limete",
    area: "Limete",
    lat: -4.398,
    lng: 15.355,
  },
  {
    id: "bracongo-gombe",
    partnerId: "bracongo",
    name: "Bracongo Gombe",
    area: "Gombe",
    lat: -4.301,
    lng: 15.308,
  },
  {
    id: "bracongo-ngaliema",
    partnerId: "bracongo",
    name: "Bracongo Ngaliema",
    area: "Ngaliema",
    lat: -4.342,
    lng: 15.262,
  },
  {
    id: "bracongo-lemba",
    partnerId: "bracongo",
    name: "Bracongo Lemba",
    area: "Lemba",
    lat: -4.405,
    lng: 15.31,
  },
  {
    id: "bracongo-bandalungwa",
    partnerId: "bracongo",
    name: "Bracongo Bandalungwa",
    area: "Bandalungwa",
    lat: -4.368,
    lng: 15.292,
  },
]

export const KINSHASA_CENTER = { lat: -4.335, lng: 15.305 }

export function partnerName(id: PartnerId) {
  return PARTNERS.find((partner) => partner.id === id)?.name ?? id
}

export function shopsForPartner(partnerId: PartnerId | null) {
  if (!partnerId) return SHOPS
  return SHOPS.filter((shop) => shop.partnerId === partnerId)
}

export function rewardCopy(partner: Partner) {
  if (partner.kind === "telecom") {
    return {
      title: "Crédit ou mégas",
      detail:
        "Les points s’échangent en shop contre du crédit ou des mégas. Le responsable confirme, puis vous remet la récompense.",
    }
  }

  if (partner.kind === "bank") {
    return {
      title: `Services ${partner.shortName}`,
      detail: `Vos points s’échangent contre des services ${partner.shortName}, comme l’achat d’une carte ${partner.shortName}, ou contre de l’argent.`,
    }
  }

  return {
    title: `Produits ${partner.shortName}`,
    detail: `Vos points s’échangent contre des produits ${partner.shortName}, en shop, avec le responsable.`,
  }
}
