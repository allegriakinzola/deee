import "server-only"

import { z } from "zod"

import type { AuthUser } from "@/modules/auth"
import { getActiveMaterial } from "@/modules/materials"
import { AppError, ErrorCode } from "@/platform/errors"

import { assertShopStaff } from "./assert-shop"
import type { DirectoryDeposit } from "./contract"
import { pointsOfLines, toDirectoryDeposit } from "./present"
import { confirmDepositRecord, findDepositById } from "./repository"

const lineSchema = z.object({
  materialId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
})

const inputSchema = z.object({
  lines: z.array(lineSchema).min(1),
})

export async function confirmShopDeposit(
  actor: AuthUser,
  depositId: string,
  input: unknown
): Promise<DirectoryDeposit> {
  const shopId = assertShopStaff(actor)
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    throw new AppError(
      ErrorCode.VALIDATION,
      400,
      "Ajustez la liste, avec au moins un matériel."
    )
  }

  const existing = await findDepositById(depositId)
  if (!existing || existing.shop?.id !== shopId || existing.status !== "SENT") {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Cette demande n’est plus en attente."
    )
  }

  const lines = []
  for (const item of parsed.data.lines) {
    const already = existing.lines.find(
      (line) => line.materialId === item.materialId
    )
    if (already) {
      lines.push({
        materialId: already.materialId,
        quantity: item.quantity,
        pointsEach: already.pointsEach,
        name: already.name,
        category: already.category,
        image: already.image,
      })
      continue
    }
    const material = await getActiveMaterial(item.materialId)
    if (!material) {
      throw new AppError(
        ErrorCode.VALIDATION,
        404,
        "Un matériel de la liste n’est plus accepté."
      )
    }
    lines.push({
      materialId: material.id,
      quantity: item.quantity,
      pointsEach: material.points,
      name: material.name,
      category: material.category,
      image: material.image,
    })
  }

  const confirmed = await confirmDepositRecord({
    depositId,
    shopId,
    confirmedById: actor.id,
    citizenId: existing.citizenId,
    lines,
    points: pointsOfLines(lines),
  })
  if (!confirmed) {
    throw new AppError(
      ErrorCode.VALIDATION,
      404,
      "Cette demande n’est plus en attente."
    )
  }
  return toDirectoryDeposit(confirmed)
}
