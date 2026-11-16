import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { hashPassword } from "../src/platform/password"

import { seedClients } from "./clients"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

const CITIZEN_EMAIL = "citoyen@deee.local"
const COLLECTOR_EMAIL = "collecteur@gvb.deee.local"

function mailSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

function titleToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

function companyKey(partner: { shortName: string; name: string; slug: string }) {
  const blob = mailSlug(`${partner.shortName} ${partner.name} ${partner.slug}`)
  if (blob.includes("rawbank")) return "rawbank"
  if (blob.includes("vodacom")) return "vodacom"
  if (blob.includes("airtel")) return "airtel"
  if (blob.includes("equity") || blob.includes("bcdc")) return "equity"
  return mailSlug(partner.shortName) || mailSlug(partner.slug)
}

function shopLocal(
  shop: { name: string; area: string; slug: string },
  company: string
) {
  const area = mailSlug(shop.area)
  if (area && area !== "kinshasa" && area !== "rdc") return area
  const name = mailSlug(shop.name)
  if (name.includes("lemba")) return "lemba"
  if (name.includes("gombe")) return "gombe"
  if (name.includes("limete")) return "limete"
  const stripped = name.replace(company, "").replace(/shop/g, "")
  return stripped || mailSlug(shop.slug) || "shop"
}

async function main() {
  if (process.env.DEMO_SEED !== "1") {
    throw new Error("Refusé. Relancez avec DEMO_SEED=1.")
  }
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL est manquant.")

  const citizenPassword = "Citoyen-Kinshasa-2026"
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })

  try {
    const admin = await prisma.user.findFirst({
      where: { role: "GVB_ADMIN", status: "ACTIVE" },
    })
    if (!admin) {
      throw new Error("Administrateur GVB introuvable.")
    }

    const partners = await prisma.partner.findMany({
      where: { status: "ACTIVE" },
      include: {
        shops: { where: { status: "ACTIVE" }, orderBy: { name: "asc" } },
        offers: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } },
      },
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

    const ready = await prisma.partner.findMany({
      where: { status: "ACTIVE" },
      include: {
        shops: { where: { status: "ACTIVE" }, orderBy: { name: "asc" } },
        offers: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { name: "asc" },
    })

    type Account = {
      email: string
      password: string
      name: string
      role: "CITIZEN" | "GVB_COLLECTOR" | "PARTNER_ADMIN" | "SHOP_STAFF"
      partnerId?: string
      shopId?: string
    }

    const accounts: Account[] = [
      {
        email: CITIZEN_EMAIL,
        password: citizenPassword,
        name: "Citoyen démonstration",
        role: "CITIZEN",
      },
      {
        email: COLLECTOR_EMAIL,
        password: "Collecteur-Gvb-2026",
        name: "Collecteur GVB",
        role: "GVB_COLLECTOR",
      },
    ]
    const usedEmails = new Set(accounts.map((account) => account.email))

    for (const partner of ready) {
      const domain = companyKey(partner)
      const company = titleToken(domain)
      const partnerEmail = `partenaire@${domain}.deee.local`
      if (usedEmails.has(partnerEmail)) {
        throw new Error(`E-mail partenaire en double : ${partnerEmail}`)
      }
      usedEmails.add(partnerEmail)
      accounts.push({
        email: partnerEmail,
        password: `Partenaire-${company}-2026`,
        name: `Admin ${partner.shortName}`,
        role: "PARTNER_ADMIN",
        partnerId: partner.id,
      })

      const usedLocals = new Set<string>()
      for (const shop of partner.shops) {
        let local = shopLocal(shop, domain)
        if (usedLocals.has(local)) local = mailSlug(shop.slug) || `${local}2`
        if (usedLocals.has(local)) local = `${local}${shop.code.toLowerCase()}`
        usedLocals.add(local)
        const email = `${local}@${domain}.deee.local`
        if (usedEmails.has(email)) {
          throw new Error(`E-mail shop en double : ${email}`)
        }
        usedEmails.add(email)
        accounts.push({
          email,
          password: `Shop-${company}-${titleToken(local)}-2026`,
          name: `Responsable ${shop.name}`,
          role: "SHOP_STAFF",
          shopId: shop.id,
        })
      }
    }

    const hashes = new Map<string, string>()
    for (const account of accounts) {
      hashes.set(account.email, await hashPassword(account.password))
    }

    const removed = await prisma.$transaction(
      async (tx) => {
        const others = await tx.user.findMany({
          where: { id: { not: admin.id } },
          select: { id: true },
        })
        const otherIds = others.map((user) => user.id)
        if (otherIds.length > 0) {
          await tx.invitation.deleteMany({
            where: {
              OR: [
                { userId: { in: otherIds } },
                { invitedById: { in: otherIds } },
              ],
            },
          })
          await tx.ledgerEntry.deleteMany({
            where: {
              OR: [
                { userId: { in: otherIds } },
                { deposit: { citizenId: { in: otherIds } } },
                { redeem: { citizenId: { in: otherIds } } },
              ],
            },
          })
          await tx.deposit.updateMany({
            where: { confirmedById: { in: otherIds } },
            data: { confirmedById: null },
          })
          await tx.redeem.updateMany({
            where: { confirmedById: { in: otherIds } },
            data: { confirmedById: null },
          })
          await tx.deposit.deleteMany({ where: { citizenId: { in: otherIds } } })
          await tx.redeem.deleteMany({ where: { citizenId: { in: otherIds } } })
          await tx.user.deleteMany({ where: { id: { in: otherIds } } })
        }

        for (const account of accounts) {
          const user = await tx.user.create({
            data: {
              displayName: account.name,
              role: account.role,
              status: "ACTIVE",
              identities: {
                create: {
                  type: "EMAIL",
                  value: account.email,
                  verifiedAt: new Date(),
                },
              },
              credential: {
                create: { passwordHash: hashes.get(account.email)! },
              },
            },
          })
          if (account.partnerId) {
            await tx.partnerMembership.create({
              data: { partnerId: account.partnerId, userId: user.id },
            })
          }
          if (account.shopId) {
            await tx.shopMembership.create({
              data: { shopId: account.shopId, userId: user.id },
            })
          }
        }

        return otherIds.length
      },
      { timeout: 120000 }
    )

    const citizen = await prisma.user.findFirst({
      where: { identities: { some: { type: "EMAIL", value: CITIZEN_EMAIL } } },
    })
    const shop = await prisma.shop.findFirst({
      where: { status: "ACTIVE", partner: { status: "ACTIVE" } },
      include: {
        partner: { include: { offers: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } } } },
      },
      orderBy: { createdAt: "asc" },
    })
    const material = await prisma.material.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { points: "desc" },
    })
    if (!citizen || !shop || !material) {
      throw new Error("Citoyen, shop ou matériel démo introuvable.")
    }

    const quantity = Math.max(1, Math.ceil(250 / material.points))
    const points = quantity * material.points
    await prisma.deposit.create({
      data: {
        citizenId: citizen.id,
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
            userId: citizen.id,
            kind: "DEPOSIT_CREDIT",
            points,
          },
        },
      },
    })

    const offer = shop.partner.offers[0]
    const settings = await prisma.operatorSettings.findUnique({ where: { id: "gvb" } })
    const bonUsd = Number(settings?.bonUsdValue ?? 10)
    const pointsPerBon = Math.round(bonUsd / 0.04)
    if (offer && points >= pointsPerBon) {
      await prisma.redeem.create({
        data: {
          citizenId: citizen.id,
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
              userId: citizen.id,
              kind: "REDEEM_DEBIT",
              points: -pointsPerBon,
            },
          },
        },
      })
      console.log(`Échange démo confirmé : ${offer.label}`)
    }

    await seedClients(prisma)

    console.log(`Comptes retirés : ${removed}`)
    console.log(`Comptes démo : ${accounts.length}`)
    console.log(`Dépôt démo confirmé : ${quantity} × ${material.name} (${points} pts)`)
    console.log(`Citoyen démo : ${CITIZEN_EMAIL}`)
    console.log(`Mot de passe démo : ${citizenPassword}`)
    console.log(`Shop du dépôt : ${shop.name} (${shop.code})`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
