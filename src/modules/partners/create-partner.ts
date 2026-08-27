import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertCanManagePartners } from "./assert-manager"
import type { PartnerInvitationResult } from "./contract"
import { invitePartnerAdmin } from "./invite-partner-admin"
import { persistPartnerLogo } from "./persist-logo"
import {
  createPartnerRecord,
  findPartnerBySlug,
  updatePartnerLogo,
} from "./repository"
import { slugifyPartnerName } from "./slug"

const KINDS = ["TELECOM", "BANK", "PRODUCTS"] as const

const createInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  shortName: z.string().trim().min(2).max(40),
  kind: z.enum(KINDS),
  admin: z
    .object({
      displayName: z.string().trim().min(2).max(80),
      email: z.string().trim().min(3),
    })
    .optional(),
})

export type CreatePartnerResult = {
  id: string
  name: string
  invitation: PartnerInvitationResult | null
}

export async function createPartner(
  actor: AuthUser,
  input: unknown,
  logoBytes?: Buffer | null
): Promise<CreatePartnerResult> {
  assertCanManagePartners(actor)

  const parsed = createInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez le nom, le nom court et le type du partenaire."
    )
  }

  const slug = slugifyPartnerName(parsed.data.name)
  const existing = await findPartnerBySlug(slug)
  if (existing) {
    throw new AppError(
      ErrorCode.NAME_TAKEN,
      409,
      "Un partenaire avec ce nom existe déjà."
    )
  }

  const partner = await createPartnerRecord({
    name: parsed.data.name,
    shortName: parsed.data.shortName,
    slug,
    kind: parsed.data.kind,
    logo: null,
  })

  if (logoBytes && logoBytes.length > 0) {
    const logo = await persistPartnerLogo({
      partnerId: partner.id,
      bytes: logoBytes,
      previousLogo: null,
    })
    await updatePartnerLogo(partner.id, logo)
  }

  const admin = parsed.data.admin
  let invitation: PartnerInvitationResult | null = null
  if (admin) {
    invitation = await invitePartnerAdmin(actor, partner.id, {
      displayName: admin.displayName,
      email: admin.email,
    })
  }

  return {
    id: partner.id,
    name: partner.name,
    invitation,
  }
}
