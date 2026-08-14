import { PrismaClient } from "@prisma/client"
import { assertSafeTestDatabase } from "./db-guard.js"

// ─── PRODUCTION DATABASE GUARD (P59-B Stage 4D) ─────────────────────────────
// Fail-closed: no automated test suite may mutate the canonical operational DB
// (meter_pulse). A process started with TEST_MODE=1 (dedicated test-DB intent)
// that resolves to meter_pulse must refuse to start BEFORE any Prisma client
// connects, so an accidental test→production write is impossible. NODE_ENV=test
// alone (vitest default for ALL tests incl. mocked) does NOT trigger this.
const guardError = assertSafeTestDatabase(process.env)
if (guardError) {
  console.error(`FATAL [db]: ${guardError}`)
  process.exit(1)
}

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export { prisma }
export default prisma
