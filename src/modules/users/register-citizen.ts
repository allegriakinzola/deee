import "server-only"

import { z } from "zod"

import { sendInvitationEmail } from "@/modules/notify"
import { AppError, ErrorCode, isAppError } from "@/platform/errors"
import { normalizeEmail } from "@/platform/email"

import { provisionInvitedUser } from "./provision-invited-user"
import { findFirstActiveGvbAdmin } from "./repository"

const registerInputSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().min(3),
})

export type RegisterCitizenResult = {
  email: string
  emailed: boolean
}

export async function registerCitizen(
  input: unknown
): Promise<RegisterCitizenResult> {
  const parsed = registerInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Indiquez votre nom et un e-mail valide."
    )
  }

  const email = normalizeEmail(parsed.data.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(ErrorCode.VALIDATION, 400, "Indiquez un e-mail valide.")
  }

  const actor = await findFirstActiveGvbAdmin()
  if (!actor) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      503,
      "La plateforme n’est pas encore prête à ouvrir des comptes."
    )
  }

  const displayName = parsed.data.displayName
  const provisioned = await provisionInvitedUser({
    displayName,
    email,
    role: "CITIZEN",
    invitedById: actor.id,
  })

  let emailed = true
  try {
    await sendInvitationEmail({
      to: email,
      displayName,
      roleLabel: "citoyen",
      invitationUrl: provisioned.invitationUrl,
    })
  } catch (error) {
    if (isAppError(error) && error.code === ErrorCode.MAIL_FAILED) {
      emailed = false
    } else {
      throw error
    }
  }

  return { email, emailed }
}
