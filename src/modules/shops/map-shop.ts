import "server-only"

import { accessFromUser } from "@/modules/users"

import type { DirectoryShop } from "./contract"

type ShopRow = Awaited<
  ReturnType<typeof import("./repository").listShopsForPartner>
>[number]

export function toDirectoryShop(shop: ShopRow): DirectoryShop {
  const operatorUser = shop.membership?.user
  return {
    id: shop.id,
    partnerId: shop.partner.id,
    partnerName: shop.partner.name,
    partnerShortName: shop.partner.shortName,
    partnerLogo: shop.partner.logo,
    name: shop.name,
    slug: shop.slug,
    area: shop.area,
    lat: shop.lat,
    lng: shop.lng,
    status: shop.status,
    createdAt: shop.createdAt.toISOString(),
    operator: operatorUser
      ? {
          id: operatorUser.id,
          displayName: operatorUser.displayName,
          email:
            operatorUser.identities.find((identity) => identity.type === "EMAIL")
              ?.value ?? null,
          access: accessFromUser(operatorUser),
          status: operatorUser.status,
        }
      : null,
  }
}
