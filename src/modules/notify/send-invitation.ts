import "server-only"

import { AppError, ErrorCode } from "@/platform/errors"

import { sendMail } from "./mailer"
import { invitationEmail } from "./templates"

export async function sendInvitationEmail(input: {
  to: string
  displayName: string
  roleLabel: string
  invitationUrl: string
  invitedByName?: string
}): Promise<void> {
  const message = invitationEmail(input)

  try {
    await sendMail({
      to: input.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
  } catch (error) {
    console.error("Échec d’envoi de l’e-mail d’invitation", error)
    throw new AppError(
      ErrorCode.MAIL_FAILED,
      502,
      "Le compte a été créé, mais l’e-mail n’a pas pu partir. Réessayez dans un instant."
    )
  }
}
