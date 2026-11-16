import { config } from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { hashPassword } from "../src/platform/password"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

const CLIENT_PASSWORD = "Client-Kinshasa-2026"
const POINTS_PER_USD = 0.04

type DepositStatus = "SENT" | "CONFIRMED" | "REJECTED"
type RedeemStatus = "SENT" | "CONFIRMED" | "REJECTED"

type ClientSpec = {
  name: string
  email: string
  deposits: Array<{
    shop: string
    status: DepositStatus
    daysAgo: number
    lines: Array<{ material: string; quantity: number }>
  }>
  redeems: Array<{
    shop: string
    offer: string
    bons: number
    status: RedeemStatus
    daysAgo: number
  }>
}

const CLIENTS: ClientSpec[] = [
  {
    name: "Amina Kabila",
    email: "amina.kabila@deee.local",
    deposits: [
      {
        shop: "DEMO01",
        status: "CONFIRMED",
        daysAgo: 12,
        lines: [{ material: "Ordinateur portable", quantity: 4 }],
      },
    ],
    redeems: [
      { shop: "DEMO01", offer: "T-shirt", bons: 1, status: "CONFIRMED", daysAgo: 11 },
    ],
  },
  {
    name: "Patrick Ilunga",
    email: "patrick.ilunga@deee.local",
    deposits: [
      {
        shop: "KBPLLW",
        status: "CONFIRMED",
        daysAgo: 10,
        lines: [{ material: "Ordinateur portable", quantity: 4 }],
      },
    ],
    redeems: [
      { shop: "KBPLLW", offer: "Forfait data", bons: 1, status: "CONFIRMED", daysAgo: 9 },
    ],
  },
  {
    name: "Grace Mbuyi",
    email: "grace.mbuyi@deee.local",
    deposits: [
      {
        shop: "KB9A1E",
        status: "CONFIRMED",
        daysAgo: 8,
        lines: [{ material: "Smartphone tactile", quantity: 10 }],
      },
    ],
    redeems: [
      { shop: "KB9A1E", offer: "Forfait appels", bons: 1, status: "CONFIRMED", daysAgo: 7 },
    ],
  },
  {
    name: "Joseph Tshisekedi",
    email: "joseph.tshisekedi@deee.local",
    deposits: [
      {
        shop: "DEMO02",
        status: "CONFIRMED",
        daysAgo: 6,
        lines: [
          { material: "Tablette", quantity: 5 },
          { material: "Imprimante", quantity: 2 },
        ],
      },
    ],
    redeems: [
      { shop: "DEMO02", offer: "Powerbank", bons: 1, status: "CONFIRMED", daysAgo: 5 },
    ],
  },
  {
    name: "Sarah Mukendi",
    email: "sarah.mukendi@deee.local",
    deposits: [
      {
        shop: "DEMO01",
        status: "CONFIRMED",
        daysAgo: 4,
        lines: [
          { material: "Smartphone tactile", quantity: 8 },
          { material: "Ordinateur de bureau", quantity: 2 },
        ],
      },
    ],
    redeems: [
      { shop: "DEMO01", offer: "Képi", bons: 1, status: "SENT", daysAgo: 3 },
    ],
  },
  {
    name: "David Nsimba",
    email: "david.nsimba@deee.local",
    deposits: [
      {
        shop: "KBPLLW",
        status: "SENT",
        daysAgo: 2,
        lines: [{ material: "Téléphone à touches", quantity: 6 }],
      },
    ],
    redeems: [],
  },
  {
    name: "Chantal Boketshu",
    email: "chantal.boketshu@deee.local",
    deposits: [
      {
        shop: "KB9A1E",
        status: "REJECTED",
        daysAgo: 5,
        lines: [{ material: "Imprimante", quantity: 2 }],
      },
    ],
    redeems: [],
  },
  {
    name: "Eric Lumumba",
    email: "eric.lumumba@deee.local",
    deposits: [
      {
        shop: "DEMO02",
        status: "CONFIRMED",
        daysAgo: 9,
        lines: [{ material: "Ordinateur portable", quantity: 6 }],
      },
    ],
    redeems: [
      { shop: "DEMO02", offer: "T-shirt", bons: 1, status: "REJECTED", daysAgo: 8 },
    ],
  },
  {
    name: "Nadine Kalala",
    email: "nadine.kalala@deee.local",
    deposits: [
      {
        shop: "DEMO01",
        status: "CONFIRMED",
        daysAgo: 13,
        lines: [{ material: "Tablette", quantity: 2 }],
      },
      {
        shop: "KBPLLW",
        status: "CONFIRMED",
        daysAgo: 3,
        lines: [{ material: "Smartphone tactile", quantity: 8 }],
      },
    ],
    redeems: [
      { shop: "KBPLLW", offer: "Forfait data", bons: 1, status: "SENT", daysAgo: 1 },
    ],
  },
  {
    name: "Bienvenu Okito",
    email: "bienvenu.okito@deee.local",
    deposits: [
      {
        shop: "KB9A1E",
        status: "CONFIRMED",
        daysAgo: 11,
        lines: [
          { material: "Ordinateur portable", quantity: 1 },
          { material: "Tablette", quantity: 4 },
          { material: "Smartphone tactile", quantity: 3 },
        ],
      },
      {
        shop: "DEMO02",
        status: "CONFIRMED",
        daysAgo: 2,
        lines: [{ material: "Imprimante", quantity: 1 }],
      },
      {
        shop: "DEMO01",
        status: "SENT",
        daysAgo: 0,
        lines: [{ material: "Chargeur", quantity: 4 }],
      },
    ],
    redeems: [
      { shop: "DEMO02", offer: "Képi", bons: 1, status: "CONFIRMED", daysAgo: 1 },
    ],
  },
]

function at(daysAgo: number): Date {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo, 12, 0, 0)
  )
}

type ShopRow = {
  id: string
  code: string
  partner: {
    id: string
    kind: "TELECOM" | "BANK" | "PRODUCTS"
    offers: Array<{ id: string; label: string }>
  }
  membership: { userId: string } | null
}

type MaterialRow = {
  id: string
  name: string
  category: string
  image: string
  points: number
}

export async function seedClients(prisma: PrismaClient): Promise<void> {
  const settings = await prisma.operatorSettings.findUnique({ where: { id: "gvb" } })
  const bonUsd = Number(settings?.bonUsdValue ?? 10)
  const pointsPerBon = Math.round(bonUsd / POINTS_PER_USD)

  const shops = await prisma.shop.findMany({
    where: { code: { in: ["DEMO01", "KBPLLW", "KB9A1E", "DEMO02"] }, status: "ACTIVE" },
    include: {
      membership: { select: { userId: true } },
      partner: {
        select: {
          id: true,
          kind: true,
          offers: { where: { status: "ACTIVE" }, select: { id: true, label: true } },
        },
      },
    },
  })
  const shopByCode = new Map<string, ShopRow>(shops.map((shop) => [shop.code, shop]))
  for (const code of ["DEMO01", "KBPLLW", "KB9A1E", "DEMO02"]) {
    if (!shopByCode.has(code)) {
      throw new Error(`Shop introuvable : ${code}. Lancez d’abord les comptes de démonstration.`)
    }
  }

  const materials = await prisma.material.findMany({ where: { status: "ACTIVE" } })
  const materialByName = new Map<string, MaterialRow>(materials.map((item) => [item.name, item]))

  const emails = CLIENTS.map((client) => client.email)
  const previous = await prisma.user.findMany({
    where: { identities: { some: { type: "EMAIL", value: { in: emails } } } },
    select: { id: true },
  })
  const previousIds = previous.map((user) => user.id)
  if (previousIds.length > 0) {
    await prisma.ledgerEntry.deleteMany({ where: { userId: { in: previousIds } } })
    await prisma.deposit.deleteMany({ where: { citizenId: { in: previousIds } } })
    await prisma.redeem.deleteMany({ where: { citizenId: { in: previousIds } } })
    await prisma.user.deleteMany({ where: { id: { in: previousIds } } })
  }

  const passwordHash = await hashPassword(CLIENT_PASSWORD)
  let deposits = 0
  let redeems = 0

  for (const client of CLIENTS) {
    const user = await prisma.user.create({
      data: {
        displayName: client.name,
        role: "CITIZEN",
        status: "ACTIVE",
        identities: {
          create: { type: "EMAIL", value: client.email, verifiedAt: new Date() },
        },
        credential: { create: { passwordHash } },
      },
    })

    let balance = 0
    const actions = [
      ...client.deposits.map((item) => ({ kind: "deposit" as const, daysAgo: item.daysAgo, item })),
      ...client.redeems.map((item) => ({ kind: "redeem" as const, daysAgo: item.daysAgo, item })),
    ].sort((a, b) => b.daysAgo - a.daysAgo)

    for (const action of actions) {
      if (action.kind === "deposit") {
        const spec = action.item
        const shop = shopByCode.get(spec.shop)!
        const when = at(spec.daysAgo)
        const lines = spec.lines.map((line) => {
          const material = materialByName.get(line.material)
          if (!material) throw new Error(`Matériel introuvable : ${line.material}`)
          return {
            materialId: material.id,
            quantity: line.quantity,
            pointsEach: material.points,
            name: material.name,
            category: material.category,
            image: material.image,
          }
        })
        const points = lines.reduce((sum, line) => sum + line.quantity * line.pointsEach, 0)
        await prisma.deposit.create({
          data: {
            citizenId: user.id,
            shopId: shop.id,
            status: spec.status,
            sentAt: when,
            confirmedAt: spec.status === "CONFIRMED" ? when : null,
            confirmedById: spec.status === "CONFIRMED" ? shop.membership?.userId ?? null : null,
            rejectedAt: spec.status === "REJECTED" ? when : null,
            createdAt: when,
            lines: { create: lines },
            ...(spec.status === "CONFIRMED"
              ? {
                  ledgerEntries: {
                    create: { userId: user.id, kind: "DEPOSIT_CREDIT" as const, points, createdAt: when },
                  },
                }
              : {}),
          },
        })
        if (spec.status === "CONFIRMED") balance += points
        deposits += 1
        continue
      }

      const spec = action.item
      const shop = shopByCode.get(spec.shop)!
      const offer = shop.partner.offers.find((item) => item.label === spec.offer)
      if (!offer) throw new Error(`Offre introuvable : ${spec.offer} (${spec.shop})`)
      const points = spec.bons * pointsPerBon
      if ((spec.status === "CONFIRMED" || spec.status === "SENT") && balance < points) {
        throw new Error(`${client.email} n’a pas assez de points pour ${spec.offer}.`)
      }
      const when = at(spec.daysAgo)
      await prisma.redeem.create({
        data: {
          citizenId: user.id,
          shopId: shop.id,
          status: spec.status,
          bons: spec.bons,
          points,
          rewardId: offer.id,
          rewardLabel: offer.label,
          partnerKind: shop.partner.kind,
          usdValue: (spec.bons * bonUsd).toFixed(2),
          sentAt: when,
          confirmedAt: spec.status === "CONFIRMED" ? when : null,
          confirmedById: spec.status === "CONFIRMED" ? shop.membership?.userId ?? null : null,
          rejectedAt: spec.status === "REJECTED" ? when : null,
          createdAt: when,
          ...(spec.status === "CONFIRMED"
            ? {
                ledgerEntries: {
                  create: {
                    userId: user.id,
                    kind: "REDEEM_DEBIT" as const,
                    points: -points,
                    createdAt: when,
                  },
                },
              }
            : {}),
        },
      })
      if (spec.status === "CONFIRMED") balance -= points
      redeems += 1
    }

    console.log(`${client.name} <${client.email}> solde ${balance} pts`)
  }

  console.log(`Clients : ${CLIENTS.length}. Mot de passe : ${CLIENT_PASSWORD}`)
  console.log(`Dépôts : ${deposits}. Échanges : ${redeems}.`)
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL est manquant.")
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })
  try {
    await seedClients(prisma)
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1]?.includes("clients.ts")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
