import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

import { hashPassword } from "../src/platform/password"
import {
  GVB_ADMIN_DISPLAY_NAME,
  parseGvbAdminSeedInput,
} from "../src/modules/users/gvb-admin-profile"
import { SEED_MATERIALS } from "../src/lib/catalog-materials"
import {
  DEFAULT_BON_USD,
  OPERATOR_SETTINGS_ID,
} from "../src/modules/settings/defaults"

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

    const existingSettings = await prisma.operatorSettings.findUnique({
      where: { id: OPERATOR_SETTINGS_ID },
    })
    if (!existingSettings) {
      await prisma.operatorSettings.create({
        data: {
          id: OPERATOR_SETTINGS_ID,
          bonUsdValue: DEFAULT_BON_USD,
        },
      })
      console.log("Paramètres opérateur créés (1 bon = 10 USD).")
    }

    const existingMaterials = await prisma.material.findMany()
    const combined = existingMaterials.filter((item) => item.name.includes("/"))
    for (const item of combined) {
      await prisma.material.delete({ where: { id: item.id } })
    }
    const remaining = await prisma.material.findMany()
    let created = 0
    let imaged = 0
    for (const material of SEED_MATERIALS) {
      const found = remaining.find(
        (item) =>
          item.category === material.category && item.name === material.name
      )
      if (!found) {
        await prisma.material.create({ data: material })
        created += 1
        continue
      }
      if (found.image !== material.image) {
        await prisma.material.update({
          where: { id: found.id },
          data: { image: material.image },
        })
        imaged += 1
      }
    }
    if (combined.length > 0 || created > 0 || imaged > 0) {
      console.log(
        `Matériels prêts (retirés groupés : ${combined.length}, ajoutés : ${created}, images : ${imaged}).`
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
