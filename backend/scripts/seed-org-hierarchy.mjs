import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// Clean test-junk projects (T027 artifacts, no real zones)
const junk = await prisma.project.deleteMany({ where: { name: { startsWith: "T027" } } })
console.log("cleaned T027 projects:", junk.count)

// Seed the 3 real Area records (currently only exist as meter.area values)
const areaDefs = [
  { name: "October", code: "OCT" },
  { name: "New Cairo", code: "NEW" },
  { name: "SODIC", code: "SOD" },
]
const areaIds = {}
for (const def of areaDefs) {
  const area = await prisma.area.upsert({
    where: { code: def.code },
    update: { name: def.name, status: "active" },
    create: { name: def.name, code: def.code, status: "active" },
  })
  areaIds[def.code] = area.id
}
console.log("seeded area records:", areaDefs.map(d => d.code).join(", "))

const areas = await prisma.area.findMany({ where: { code: { in: ["OCT", "NEW", "SOD"] } } })
console.log("areas:", areas.map(a => a.code).join(", "))
if (areas.length === 0) {
  console.log("No real areas found — skipping")
  await prisma.$disconnect()
  process.exit(0)
}

// Find or create the enterprise organization
let org = await prisma.organization.findFirst({ where: { name: "EOX Enterprise" } })
if (!org) {
  org = await prisma.organization.create({ data: { name: "EOX Enterprise", slug: "eox-enterprise", plan: "enterprise", status: "active" } })
}
console.log("organization:", org.name, org.id)

// Create projects per area + zones + units
const areaProjects = {
  OCT: [{ name: "October Phase 1", code: "OCT-P1" }, { name: "October Phase 2", code: "OCT-P2" }],
  NEW: [{ name: "New Cairo East", code: "NEW-E" }, { name: "New Cairo West", code: "NEW-W" }],
  SOD: [{ name: "SODIC Zayed", code: "SOD-Z" }],
}

let unitsCreated = 0
let zonesCreated = 0
for (const area of areas) {
  const defs = areaProjects[area.code] || []
  for (const def of defs) {
    let project = await prisma.project.findFirst({ where: { name: def.name } })
    if (!project) {
      project = await prisma.project.create({ data: { name: def.name, organizationId: org.id, areaId: area.id, status: "active", taxRate: 0.14 } })
    }
    const zones = [{ name: `${def.name} Zone A`, code: `${def.code}-ZA` }, { name: `${def.name} Zone B`, code: `${def.code}-ZB` }]
    for (const z of zones) {
      const zone = await prisma.zone.upsert({
        where: { code: z.code },
        update: { projectId: project.id },
        create: { name: z.name, code: z.code, projectId: project.id },
      })
      zonesCreated++
      for (let i = 1; i <= 6; i++) {
        const unitCode = `${z.code}-U${String(i).padStart(2, "0")}`
        await prisma.unit.upsert({
          where: { code: unitCode },
          update: { zoneId: zone.id },
          create: { name: `Unit ${i}`, code: unitCode, zoneId: zone.id, type: "residential", area: 120 },
        })
        unitsCreated++
      }
    }
  }
}
console.log(`projects seeded per area; zones: ${zonesCreated}, units: ${unitsCreated}`)

const tree = await prisma.area.findMany({ include: { projects: { include: { zones: { include: { units: true } } } } } })
for (const a of tree) {
  const pCount = a.projects.length
  const zCount = a.projects.reduce((s, p) => s + p.zones.length, 0)
  const uCount = a.projects.reduce((s, p) => s + p.zones.reduce((s2, z) => s2 + z.units.length, 0), 0)
  console.log(`  ${a.code} (${a.name}): ${pCount} projects, ${zCount} zones, ${uCount} units`)
}
await prisma.$disconnect()
