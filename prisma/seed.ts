import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

import { hashPassword } from "../src/platform/password"
import {
  GVB_ADMIN_DISPLAY_NAME,
  parseGvbAdminSeedInput,
} from "../src/modules/users/gvb-admin-profile"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

async function seed() {
  const { email, password } = parseGvbAdminSeedInput({
    email: process.env.GVB_ADMIN_EMAIL,
    password: process.env.GVB_ADMIN_PASSWORD,
  })
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL est manquant.")
  }

  const passwordHash = await hashPassword(password)
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    const existing = await prisma.identity.findUnique({
      where: { type_value: { type: "EMAIL", value: email } },
    })

    if (existing) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          displayName: GVB_ADMIN_DISPLAY_NAME,
          role: "GVB_ADMIN",
          status: "ACTIVE",
          credential: {
            upsert: {
              create: { passwordHash },
              update: { passwordHash },
            },
          },
        },
      })
    } else {
      await prisma.user.create({
        data: {
          displayName: GVB_ADMIN_DISPLAY_NAME,
          role: "GVB_ADMIN",
          status: "ACTIVE",
          credential: { create: { passwordHash } },
          identities: {
            create: {
              type: "EMAIL",
              value: email,
              verifiedAt: new Date(),
            },
          },
        },
      })
    }

    console.log(`Administrateur GVB prêt : ${email}`)
  } finally {
    await prisma.$disconnect()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
