import "server-only"

import { randomBytes } from "node:crypto"

import { normalizeShopCode } from "@/lib/shop-code"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateShopCode(): string {
  const bytes = randomBytes(6)
  let code = ""
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length]
  }
  return normalizeShopCode(code)
}
