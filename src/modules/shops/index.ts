/**
 * Shops — points de dépôt. Le partenaire les crée ; un seul compte par boutique.
 * La GVB consulte le réseau, sans action pour l’instant.
 */
export type { ShopStatus } from "@/generated/prisma/client"
export type {
  DirectoryShop,
  ShopInvitationResult,
  ShopOperator,
} from "./contract"
export { listPartnerShops, listNetworkShops } from "./list-shops"
export { createShop } from "./create-shop"
export { updateShop } from "./update-shop"
export { setShopStatus } from "./set-shop-status"
export { deleteShop } from "./delete-shop"
export { inviteShopStaff } from "./invite-shop-staff"
