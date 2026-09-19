import type { DepositStatus } from "@/generated/prisma/client"

export type DirectoryDepositLine = {
  id: string
  materialId: string
  name: string
  category: string
  image: string
  quantity: number
  pointsEach: number
  pointsTotal: number
}

export type DirectoryDeposit = {
  id: string
  status: DepositStatus
  shopId: string | null
  shopName: string | null
  shopCode: string | null
  shopArea: string | null
  citizenName: string
  sentAt: string | null
  confirmedAt: string | null
  rejectedAt: string | null
  createdAt: string
  pointsTotal: number
  lines: DirectoryDepositLine[]
}
