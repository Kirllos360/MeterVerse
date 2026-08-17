// P13.8 — Import the REAL historical solar billing for meter 52051449
// Source: Meter/reports/solar-wallet-replay-report.md (Detailed Replay: Customer 52051449)
// The report is a replay of the REAL exported collection data; invoice amounts
// reconcile with Solar_Invoices_Import.xlsx (2021-01 = 36.10). Amounts + receipts
// are REAL. Underlying registers (180/280) are UNKNOWN per the report's Finding A-2.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SERIAL = '52051449';

// Monthly invoice history from the report (65 real amounts)
const INVOICES = [
  ['2021-01', 36.10], ['2021-01', 36.10], ['2021-02', 36.10], ['2021-03', 36.10], ['2021-04', 36.10],
  ['2021-05', 36.10], ['2021-06', 36.10], ['2021-07', 36.10], ['2021-08', 36.10], ['2021-09', 36.10],
  ['2021-10', 36.10], ['2021-11', 36.10], ['2021-12', 36.10],
  ['2022-01', 9.10], ['2022-02', 9.10], ['2022-03', 9.10], ['2022-04', 9.10], ['2022-05', 9.10],
  ['2022-06', 9.10], ['2022-07', 9.10], ['2022-08', 9.10], ['2022-09', 1426.10], ['2022-10', 1201.42],
  ['2022-11', 706.98], ['2022-12', 1160.46],
  ['2023-01', 2038.85], ['2023-02', 1206.08], ['2023-03', 110.05], ['2023-04', 150.09],
  ['2023-05', 1562.68], ['2023-06', 2059.56], ['2023-07', 1875.97], ['2023-08', 1196.30],
  ['2023-09', 2597.86], ['2023-10', 1545.63], ['2023-11', 1038.86], ['2023-12', 1465.10],
  ['2024-01', 1225.10], ['2024-02', 1342.10], ['2024-03', 348.58], ['2024-04', 1157.10],
  ['2024-05', 2253.10], ['2024-06', 2399.54], ['2024-07', 2171.11], ['2024-08', 1956.76],
  ['2024-09', 4937.55], ['2024-10', 2465.29], ['2024-11', 1007.10], ['2024-12', 1951.10],
  ['2025-01', 3150.08], ['2025-02', 2947.45], ['2025-03', 656.00], ['2025-04', 382.45],
  ['2025-05', 1835.17], ['2025-06', 2686.63], ['2025-07', 3159.18], ['2025-08', 2045.30],
  ['2025-09', 3335.41], ['2025-10', 2529.96], ['2025-11', 1438.40], ['2025-12', 1694.60],
  ['2026-01', 3479.44], ['2026-02', 943.93], ['2026-03', 2001.91], ['2026-04', 471.51],
];

// Payment history from the report (23 real receipts)
const PAYMENTS = [
  ['2023-02', 5723.00], ['2023-06', 3506.00], ['2023-09', 5497.00], ['2023-10', 1197.00],
  ['2023-11', 2598.00], ['2024-01', 2584.00], ['2024-03', 1465.00], ['2024-04', 1226.00],
  ['2024-05', 1690.00], ['2024-06', 1157.00], ['2024-08', 6824.00], ['2024-10', 6894.00],
  ['2024-11', 2466.00], ['2025-01', 2958.00], ['2025-02', 3149.50], ['2025-04', 3603.45],
  ['2025-06', 382.45], ['2025-07', 4521.81], ['2025-08', 3159.17], ['2025-10', 5380.72],
  ['2025-12', 3968.36], ['2026-02', 1694.60], ['2026-03', 3479.44],
];

async function main() {
  const meter = await prisma.meter.findUnique({ where: { serial: SERIAL } });
  if (!meter) throw new Error(`meter ${SERIAL} not found`);
  const customerId = meter.customerId;
  if (!customerId) throw new Error(`meter ${SERIAL} has no customerId`);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error(`customer ${customerId} not found`);
  console.log(`Target: meter ${SERIAL} (${meter.id}) -> customer ${customer.name} (${customer.id})`);

  // Idempotent: skip months already present
  const existing = await prisma.invoice.findMany({ where: { number: { startsWith: `SOLAR-${SERIAL}-` } }, select: { number: true } });
  const existingNumbers = new Set(existing.map(e => e.number));
  let created = 0, skipped = 0;
  const monthCount = new Map(); // month -> occurrences seen

  for (const [month, amount] of INVOICES) {
    const [y, m] = month.split('-').map(Number);
    const nth = (monthCount.get(month) || 0) + 1;
    monthCount.set(month, nth);
    const num = nth > 1 ? `SOLAR-${SERIAL}-${month}-${nth}` : `SOLAR-${SERIAL}-${month}`;
    if (existingNumbers.has(num)) { skipped++; continue; }
    await prisma.invoice.create({
      data: {
        number: num,
        customerId,
        amount,
        status: 'issued',
        billingPeriodStart: new Date(y, m - 1, 1),
        billingPeriodEnd: new Date(y, m, 0),
        issuedAt: new Date(y, m - 1, 15),
        dueDate: new Date(y, m, 15),
        immutableAt: new Date(y, m - 1, 15),
        areaId: meter.areaId,
        projectId: null,
      },
    });
    created++;
  }
  console.log(`Invoices: created=${created} skipped=${skipped} (expected total ${INVOICES.length})`);

  // Payments
  const existingPays = await prisma.payment.findMany({ where: { customerId }, select: { reference: true } });
  const existingRefs = new Set(existingPays.map(p => p.reference));
  let payCreated = 0, paySkipped = 0;
  for (const [month, amount] of PAYMENTS) {
    const ref = `REC-SOLAR-${SERIAL}-${month}`;
    if (existingRefs.has(ref)) { paySkipped++; continue; }
    const [y, m] = month.split('-').map(Number);
    await prisma.payment.create({
      data: {
        customerId,
        amount,
        method: 'cash',
        status: 'completed',
        reference: ref,
        paidAt: new Date(y, m - 1, 28),
        areaId: meter.areaId,
        projectId: null,
      },
    });
    payCreated++;
  }
  console.log(`Payments: created=${payCreated} skipped=${paySkipped} (expected total ${PAYMENTS.length})`);

  const invTotal = await prisma.invoice.aggregate({ where: { customerId, number: { startsWith: `SOLAR-${SERIAL}-` } }, _sum: { amount: true } });
  const payTotal = await prisma.payment.aggregate({ where: { customerId, reference: { startsWith: `REC-SOLAR-${SERIAL}-` } }, _sum: { amount: true } });
  console.log(`TOTALS -> invoiced ${invTotal._sum.amount.toFixed(2)} | paid ${payTotal._sum.amount.toFixed(2)} | balance ${(invTotal._sum.amount - payTotal._sum.amount).toFixed(2)}`);
  console.log(`Report expects: invoiced 77855.94 | paid 75124.50 | balance 2731.44`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error('ERROR:', e.message); await prisma.$disconnect(); process.exit(1); });