import "server-only"

import type { PartnerStatus } from "@/generated/prisma/client"

import { countPartnerMemberships, countPartners } from "./repository"

export async function countDirectoryPartners(status?: PartnerStatus) {
  return countPartners(status)
}

export async function countDirectoryPartnerMembers(partnerId: string) {
  return countPartnerMemberships(partnerId)
}
