import "server-only"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"
import { removePublicUpload } from "@/platform/uploads"

import { assertCanManagePartners } from "./assert-manager"
import {
  deletePartnerRecord,
  findPartnerById,
  reassignAndDeleteMember,
} from "./repository"

export async function deletePartner(actor: AuthUser, partnerId: string) {
  assertCanManagePartners(actor)

  const partner = await findPartnerById(partnerId)
  if (!partner) {
    throw new AppError(ErrorCode.VALIDATION, 404, "Ce partenaire n’existe pas.")
  }

  const operatorIds = [
    ...new Set(
      partner.shops
        .map((shop) => shop.membership?.userId)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  await removePublicUpload(partner.logo)
  await deletePartnerRecord(partnerId)

  for (const userId of operatorIds) {
    await reassignAndDeleteMember({ userId, successorId: actor.id })
  }

  return { id: partnerId }
}
