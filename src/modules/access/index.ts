/**
 * Access — qui entre où. Pas d’I/O ici : que des règles pures.
 */
export {
  homePathFor,
  canAccessGvbAdmin,
  canAccessPartnerAdmin,
  canAccessShopSpace,
  canAccessCitizenSpace,
  canManageUsers,
  canManagePartners,
  canManagePartnerMembers,
  canManageOwnShops,
  canViewNetworkShops,
} from "./policies"
