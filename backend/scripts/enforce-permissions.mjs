import { readFileSync, writeFileSync } from 'fs';

const PERMISSION_MAP = {
  customers: { list: 'customers.list', export: 'customers.export', read: 'customers.read', create: 'customers.create', update: 'customers.update', delete: 'customers.delete', stats: 'customers.read' },
  meters: { list: 'meters.list', export: 'meters.export', read: 'meters.read', create: 'meters.create', update: 'meters.update', delete: 'meters.delete' },
  readings: { list: 'readings.list', export: 'readings.export', read: 'readings.read', create: 'readings.create', update: 'readings.update', delete: 'readings.delete' },
  invoices: { list: 'invoices.list', export: 'invoices.export', read: 'invoices.read', create: 'invoices.create', update: 'invoices.update', delete: 'invoices.delete' },
  payments: { list: 'payments.list', export: 'payments.export', read: 'payments.read', create: 'payments.create', delete: 'payments.delete' },
};

const routeFiles = ['customers.js', 'meters.js', 'readings.js', 'invoices.js', 'payments.js'];

for (const file of routeFiles) {
  const path = 'src/routes/' + file;
  let content = readFileSync(path, 'utf8');
  const entity = file.replace('.js', '');
  const actions = PERMISSION_MAP[entity];

  // Add requirePermission import
  if (content.indexOf('requirePermission') === -1) {
    content = content.replace(
      /import \{ /,
      'import { requirePermission, '
    );
    content = content.replace(
      /} from "\.\.\/middleware\/security\.js"/,
      '} from "../middleware/security.js"'
    );
    // Add actual import if not present via security.js
    if (content.indexOf('requirePermission') === -1) {
      content = content.replace(
        /from "\.\.\/middleware\/security\.js"/,
        'from "../middleware/security.js"\nimport { requirePermission } from "../middleware/permissions.js"'
      );
    }
  }

  // Replace requireRole with requirePermission for each route
  content = content.replace(
    /router\.get\("\/", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    'router.get("/", requirePermission("' + entity + '.list")'
  );
  content = content.replace(
    /router\.get\("\/(export|stats)", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    (match, p1) => 'router.get("/' + p1 + '", requirePermission("' + entity + '.' + (p1 === 'export' ? 'export' : 'read') + '")'
  );
  content = content.replace(
    /router\.get\("\/:id", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    'router.get("/:id", requirePermission("' + entity + '.read")'
  );
  content = content.replace(
    /router\.post\("\/", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    'router.post("/", requirePermission("' + entity + '.create")'
  );
  content = content.replace(
    /router\.post\("\/bulk", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    'router.post("/bulk", requirePermission("' + entity + '.create")'
  );
  content = content.replace(
    /router\.post\("\/generate", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    'router.post("/generate", requirePermission("' + entity + '.create")'
  );
  content = content.replace(
    /router\.put\("\/:id", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    'router.put("/:id", requirePermission("' + entity + '.update")'
  );
  content = content.replace(
    /router\.delete\("\/:id", requireRole\("[^"]+",? ?"[^"]*"?\)/g,
    'router.delete("/:id", requirePermission("' + entity + '.delete")'
  );

  writeFileSync(path, content);
  console.log('  Updated permissions: ' + file);
}

// Seed permissions
const { prisma } = await import('../src/db.js');
const allPerms = [...new Set(Object.values(PERMISSION_MAP).flatMap(e => Object.values(e)))];
for (const key of allPerms) {
  await prisma.permission.upsert({
    where: { name: key },
    update: {},
    create: { name: key, module: key.split('.')[0], description: 'Permission for ' + key },
  }).catch(() => {});
}
console.log('  Seeded ' + allPerms.length + ' permission keys');
await prisma.$disconnect();

console.log('Done.');
