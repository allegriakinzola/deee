import "server-only"

import type { PublicPartner, PublicShop } from "@/lib/public-directory"

import { listActivePublicPartners, listActivePublicShops } from "./repository"

export type PublicDirectory = {
  partners: PublicPartner[]
  shops: PublicShop[]
}

export async function listPublicDirectory(): Promise<PublicDirectory> {
  const [partners, shops] = await Promise.all([
    listActivePublicPartners(),
    listActivePublicShops(),
  ])

  return {
    partners: partners.map((partner) => ({
      id: partner.slug,
      name: partner.name,
      shortName: partner.shortName,
      logo: partner.logo,
      kind: partner.kind,
      rewardKind: partner.rewardKind,
    })),
    shops: shops.map((shop) => ({
      id: shop.id,
      partnerId: shop.partner.slug,
      partnerName: shop.partner.shortName,
      name: shop.name,
      area: shop.area,
      lat: shop.lat,
      lng: shop.lng,
    })),
  }
}
