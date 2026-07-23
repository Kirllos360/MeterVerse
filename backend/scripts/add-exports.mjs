import { readFileSync, writeFileSync } from 'fs';

const DIR = 'D:/meter/backend';

const files = {
  [DIR + '/src/routes/invoices.js']: {
    entity: 'invoice',
    header: 'number,customerId,amount,status,dueDate,issuedAt,paidAt,createdAt',
    filename: 'invoices.csv',
  },
  [DIR + '/src/routes/readings.js']: {
    entity: 'reading',
    header: 'meterId,value,unit,timestamp,source,status,createdAt',
    filename: 'readings.csv',
  },
  [DIR + '/src/routes/payments.js']: {
    entity: 'payment',
    header: 'invoiceId,amount,method,status,paidAt,createdAt',
    filename: 'payments.csv',
  },
};

for (const [file, cfg] of Object.entries(files)) {
  let content = readFileSync(file, 'utf8');

  const exportBlock = [
    '',
    'router.get("/export", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {',
    '  try {',
    `    const items = await prisma.${cfg.entity}.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" } })`,
    `    const header = "${cfg.header}"`,
    `    const rows = items.map(i => [${cfg.header.split(',').map(f => `i.${f}`).join(', ')}].join(","))`,
    '    res.setHeader("Content-Type", "text/csv")',
    `    res.setHeader("Content-Disposition", "attachment; filename=${cfg.filename}")`,
    '    res.send([header, ...rows].join("\\n"))',
    `    auditLog(req, "${cfg.entity}.export", { count: items.length })`,
    '  } catch (err) { next(err) }',
    '})',
    '',
  ].join('\n');

  content = content.replace(/router\.get\("\/:id"/, exportBlock + '\nrouter.get("/:id"');
  writeFileSync(file, content);
  console.log('  OK: ' + file);
}

console.log('Done.');
