import { config } from "dotenv"
import { randomBytes } from "node:crypto"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { hashPassword } from "../src/platform/password"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

const DEMO_EMAIL = "demo.citoyen@deee.local"

async function main() {
  if (process.env.DEMO_SEED !== "1") {
    throw new Error("Refusé. Relancez avec DEMO_SEED=1.")
  }
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL est manquant.")

  const password =
    process.env.DEMO_CITIZEN_PASSWORD?.trim() ||
    `Demo-${randomBytes(4).toString("hex")}`
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })

  try {
    const partners = await prisma.partner.findMany({
      where: { status: "ACTIVE" },
      include: { shops: true, offers: { where: { status: "ACTIVE" } } },
      orderBy: { name: "asc" },
    })

    let shopIndex = 0
    for (const partner of partners) {
      if (partner.shops.length > 0) continue
      shopIndex += 1
      let code = `DEMO${String(shopIndex).padStart(2, "0")}`
      while (await prisma.shop.findUnique({ where: { code } })) {
        shopIndex += 1
        code = `DEMO${String(shopIndex).padStart(2, "0")}`
      }
      await prisma.shop.create({
        data: {
          partnerId: partner.id,
          name: `${partner.shortName} Gombe`,
          slug: "gombe",
          code,
          area: "Gombe",
          lat: -4.305 + shopIndex * 0.004,
          lng: 15.313 + shopIndex * 0.003,
          status: "ACTIVE",
        },
      })
      console.log(`Shop démo créé : ${partner.shortName} Gombe (${code})`)
    }

    const shop = await prisma.shop.findFirst({
      where: { status: "ACTIVE", partner: { status: "ACTIVE" } },
      include: { partner: { include: { offers: { where: { status: "ACTIVE" } } } } },
      orderBy: { createdAt: "asc" },
    })
    const material = await prisma.material.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { points: "desc" },
    })
    if (!shop || !material) {
      console.log("Pas de shop ou de matériel actif : citoyen démo non créé.")
      return
    }

    const passwordHash = await hashPassword(password)
    const identity = await prisma.identity.findUnique({
      where: { type_value: { type: "EMAIL", value: DEMO_EMAIL } },
    })
    const user = identity
      ? await prisma.user.update({
          where: { id: identity.userId },
          data: {
            displayName: "Citoyen démo",
            role: "CITIZEN",
            status: "ACTIVE",
            credential: {
              upsert: { create: { passwordHash }, update: { passwordHash } },
            },
          },
        })
      : await prisma.user.create({
          data: {
            displayName: "Citoyen démo",
            role: "CITIZEN",
            status: "ACTIVE",
            credential: { create: { passwordHash } },
            identities: {
              create: {
                type: "EMAIL",
                value: DEMO_EMAIL,
                verifiedAt: new Date(),
              },
            },
          },
        })

    const existingDeposit = await prisma.deposit.findFirst({
      where: { citizenId: user.id, status: "CONFIRMED" },
    })
    if (!existingDeposit) {
      const quantity = Math.max(1, Math.ceil(250 / material.points))
      const points = quantity * material.points
      await prisma.deposit.create({
        data: {
          citizenId: user.id,
          shopId: shop.id,
          status: "CONFIRMED",
          sentAt: new Date(),
          confirmedAt: new Date(),
          lines: {
            create: {
              materialId: material.id,
              quantity,
              pointsEach: material.points,
              name: material.name,
              category: material.category,
              image: material.image,
            },
          },
          ledgerEntries: {
            create: {
              userId: user.id,
              kind: "DEPOSIT_CREDIT",
              points,
            },
          },
        },
      })
      console.log(`Dépôt démo confirmé : ${quantity} × ${material.name} (${points} pts)`)
    }

    const existingRedeem = await prisma.redeem.findFirst({
      where: { citizenId: user.id, status: "CONFIRMED" },
    })
    const offer = shop.partner.offers[0]
    const balance = await prisma.ledgerEntry.aggregate({
      where: { userId: user.id },
      _sum: { points: true },
    })
    const settings = await prisma.operatorSettings.findUnique({ where: { id: "gvb" } })
    const bonUsd = Number(settings?.bonUsdValue ?? 10)
    const pointsPerBon = Math.round(bonUsd / 0.04)
    if (!existingRedeem && offer && (balance._sum.points ?? 0) >= pointsPerBon) {
      await prisma.redeem.create({
        data: {
          citizenId: user.id,
          shopId: shop.id,
          status: "CONFIRMED",
          bons: 1,
          points: pointsPerBon,
          rewardId: offer.id,
          rewardLabel: offer.label,
          partnerKind: shop.partner.kind,
          usdValue: bonUsd.toFixed(2),
          confirmedAt: new Date(),
          ledgerEntries: {
            create: {
              userId: user.id,
              kind: "REDEEM_DEBIT",
              points: -pointsPerBon,
            },
          },
        },
      })
      console.log(`Échange démo confirmé : ${offer.label}`)
    }

    console.log(`Citoyen démo : ${DEMO_EMAIL}`)
    console.log(`Mot de passe démo : ${password}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
