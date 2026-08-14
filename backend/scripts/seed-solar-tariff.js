// P59-C/LR-6 — Seed Solar Tiered Tariff
// Recovered from legacy Collection System runtime tariff_table
// (routes_admin.py:676-681) as a MeterVerse-native Tariff + TariffTier set.
// Additive seed — creates/updates the Solar tariff only. Does NOT touch the
// P59-B frozen population or any customer/meter data.
//
// Usage: node scripts/seed-solar-tariff.js
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Verified runtime schedule: first `limit` units at `rate`, cumulative.
const SOLAR_TIERS = [
  { max: 50, rate: 0.48 }, { max: 100, rate: 0.58 }, { max: 150, rate: 0.68 },
  { max: 200, rate: 0.78 }, { max: 300, rate: 0.88 }, { max: 400, rate: 0.98 },
  { max: 500, rate: 1.08 }, { max: 600, rate: 1.18 }, { max: 700, rate: 1.28 },
  { max: 800, rate: 1.38 }, { max: 900, rate: 1.48 }, { max: 1000, rate: 1.58 },
]

async function main() {
  const existing = await prisma.tariff.findUnique({ where: { code: "SOLAR" } })
  const tariff = existing
    ? await prisma.tariff.update({ where: { id: existing.id }, data: { status: "active", archivedAt: null } })
    : await prisma.tariff.create({
        data: {
          name: "Solar Net Metering",
          code: "SOLAR",
          description: "Solar tariff (tiered, recovered from legacy Collection System runtime)",
          type: "tiered",
          currency: "EGP",
          unit: "kWh",
          effectiveFrom: new Date("2026-01-01"),
          status: "active",
        },
      })

  // Replace tiers idempotently: delete existing tiers then insert verified schedule.
  await prisma.tariffTier.deleteMany({ where: { tariffId: tariff.id } })
  let prevMax = 0
  for (const [i, t] of SOLAR_TIERS.entries()) {
    await prisma.tariffTier.create({
      data: {
        tariffId: tariff.id,
        name: `Tier ${i + 1}`,
        minValue: prevMax,
        maxValue: t.max,
        rate: t.rate,
        priority: i,
      },
    })
    prevMax = t.max
  }

  console.log(`Solar tariff ready: ${tariff.id} (${SOLAR_TIERS.length} tiers, >1000 kWh @ 1.68 not represented as tier)`)

  // Add the over-limit rate as a flat rate (MeterVerse business-engine applies rates on top of tiers).
  await prisma.tariffRate.deleteMany({ where: { tariffId: tariff.id } })
  await prisma.tariffRate.create({
    data: { tariffId: tariff.id, name: "Over 1000 kWh", rate: 1.68, priority: 99 },
  })

  console.log("Over-limit rate 1.68 added.")
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
