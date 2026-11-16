import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

import { SEED_MATERIALS } from "../src/lib/catalog-materials"
import {
  DEFAULT_BON_USD,
  OPERATOR_SETTINGS_ID,
} from "../src/modules/settings/defaults"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL est manquant.")
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  try {
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
