import { prisma } from '../src/db.js';

const perms = [
  'customers.list','customers.read','customers.create','customers.update','customers.delete','customers.export',
  'meters.list','meters.read','meters.create','meters.update','meters.delete','meters.export',
  'readings.list','readings.read','readings.create','readings.update','readings.delete','readings.export',
  'invoices.list','invoices.read','invoices.create','invoices.update','invoices.delete','invoices.export',
  'payments.list','payments.read','payments.create','payments.delete','payments.export',
  'notifications.list','notifications.read','notifications.create','notifications.update','notifications.delete',
  'meter_assignments.list','meter_assignments.read','meter_assignments.create','meter_assignments.update','meter_assignments.delete',
  'admin.list','admin.read','admin.create','admin.update','admin.delete',
];

for (const key of perms) {
  await prisma.permission.upsert({
    where: { name: key },
    update: {},
    create: { name: key, module: key.split('.')[0], description: 'Permission for ' + key },
  });
}

const count = await prisma.permission.count();
console.log('Total permission keys in DB: ' + count);
await prisma.$disconnect();
