import "server-only"

import { prisma } from "@/platform/db"

import type { ParsedIdentifier } from "./parse-identifier"

export async function findUserByIdentifier(identifier: ParsedIdentifier) {
  const identity = await prisma.identity.findUnique({
    where: {
      type_value: {
        type: identifier.type,
        value: identifier.value,
      },
    },
    include: {
      user: {
        include: {
          credential: true,
          identities: true,
          partnerMemberships: {
            include: {
              partner: {
                select: { id: true, name: true, logo: true, status: true },
              },
            },
          },
          shopMembership: {
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  partner: {
                    select: { id: true, name: true, logo: true, status: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  return identity?.user ?? null
}
