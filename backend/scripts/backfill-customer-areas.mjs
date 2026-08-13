#!/usr/bin/env node
// P59: backfill areaId on customers that have none (round-robin across areas)
// so tenancy enforcement has real scope data. Idempotent.
import { prisma } from "../src/db.js";

async function main() {
  const areas = await prisma.area.findMany({ orderBy: { code: "asc" } });
  if (areas.length === 0) { console.log("No areas found - nothing to assign."); await prisma.$disconnect(); return; }
  const areaIds = areas.map(a => a.id);
  const noArea = await prisma.customer.findMany({ where: { areaId: null }, select: { id: true } });
  let updated = 0;
  for (let i = 0; i < noArea.length; i++) {
    await prisma.customer.update({ where: { id: noArea[i].id }, data: { areaId: areaIds[i % areaIds.length] } });
    updated++;
  }
  console.log(`Backfilled areaId on ${updated} customers (across ${areas.length} areas: ${areas.map(a => a.code).join(", ")}).`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
