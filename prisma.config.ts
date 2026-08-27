import { config } from "dotenv"
import { defineConfig } from "prisma/config"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

// Valeurs telles quelles dans .env : DIRECT_URL (migrations), sinon DATABASE_URL.
const databaseUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || ""

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
})
