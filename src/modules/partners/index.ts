/**
 * Partners — entreprises partenaires (télécom, banque, produits).
 * La GVB les crée ; un administrateur d’entreprise y est rattaché par invitation.
 */
export type { PartnerKind, PartnerStatus } from "@/generated/prisma/client"
export type {
  DirectoryPartner,
  DirectoryPartnerAdmin,
  PartnerInvitationResult,
} from "./contract"
export { listDirectoryPartners } from "./list-partners"
export { listPartnerMembers } from "./list-partner-members"
export { createPartner } from "./create-partner"
export { invitePartnerAdmin } from "./invite-partner-admin"
export { setPartnerStatus } from "./set-partner-status"
export { setPartnerLogo } from "./set-partner-logo"
export { setPartnerMemberStatus } from "./set-partner-member-status"
export { deletePartnerMember } from "./delete-partner-member"
export { deletePartner } from "./delete-partner"
