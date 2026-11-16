import { config } from "dotenv"
import { defineConfig } from "prisma/config"

config({ path: ".env", override: true })
config({ path: ".env.local", override: true })

const databaseUrl =
  process.env.DATABASE_URL?.trim() || "postgresql://localhost:5432/deee"

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
