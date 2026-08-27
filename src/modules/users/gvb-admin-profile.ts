import { normalizeEmail } from "@/platform/email"

export const GVB_ADMIN_DISPLAY_NAME = "Administrateur GVB"

export function parseGvbAdminSeedInput(input: {
  email?: string
  password?: string
}): { email: string; password: string } {
  const emailRaw = input.email?.trim()
  const password = input.password ?? ""

  if (!emailRaw || !password) {
    throw new Error(
      "GVB_ADMIN_EMAIL et GVB_ADMIN_PASSWORD sont requis pour le seed."
    )
  }

  if (password.length < 10) {
    throw new Error("GVB_ADMIN_PASSWORD doit faire au moins 10 caractères.")
  }

  return { email: normalizeEmail(emailRaw), password }
}
