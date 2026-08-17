process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/meter_pulse';
process.env.PDF_OUTPUT_DIR = 'D:/meter/backend/pdf-output';
const fs = await import('node:fs');
const { PrismaClient } = await import('@prisma/client');
const { generateInvoicePdf } = await import('../src/services/pdf-engine.js');
const prisma = new PrismaClient();
try {
  const invoices = await prisma.invoice.findMany({
    where: { number: { in: ['SOLAR-52051449-2021-01', 'SOLAR-52051449-2021-02', 'SOLAR-52051449-2021-03', 'SOLAR-52051449-2022-09', 'SOLAR-52051449-2026-04'] } },
    include: { customer: true },
  });
  for (const inv of invoices) {
    const r = await generateInvoicePdf(inv, inv.customer);
    console.log('SAMPLE', inv.number, inv.amount, '->', r.filename, fs.statSync(r.filepath).size, 'bytes');
  }
} finally { await prisma.$disconnect(); }
