import { config } from "dotenv"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`)
  }
  return value
}

export function getDatabaseUrl(): string {
  return required("DATABASE_URL")
}

export function getDirectUrl(): string {
  return process.env.DIRECT_URL?.trim() || getDatabaseUrl()
}

export function getSmtpConfig(): {
  host: string
  port: number
  user: string
  pass: string
  from: string
} {
  const user = required("SMTP_USER")
  const pass = required("SMTP_PASS").replace(/\s+/g, "")
  const port = Number(process.env.SMTP_PORT?.trim() || "587")

  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number.isFinite(port) ? port : 587,
    user,
    pass,
    from: process.env.SMTP_FROM?.trim() || `DEEE Kinshasa <${user}>`,
  }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}
