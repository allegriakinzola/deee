import "server-only"

import type { RewardKind } from "@/generated/prisma/client"

import { findActiveOffer, listActiveOffers } from "./repository"

export async function loadPartnerRedeemOffers(
  partnerId: string,
  rewardKind: RewardKind
) {
  return listActiveOffers(partnerId, rewardKind)
}

export async function findPartnerRedeemOffer(
  partnerId: string,
  offerId: string,
  rewardKind: RewardKind
) {
  return findActiveOffer(partnerId, offerId, rewardKind)
}
