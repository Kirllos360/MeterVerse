import { prisma } from '../src/db.js';

const count = await prisma.notificationTemplate.count();
console.log('Templates in DB: ' + count);

const byType = await prisma.notificationTemplate.groupBy({
  by: ['type'],
  _count: true,
});
for (const r of byType) {
  console.log('  ' + r.type + ': ' + r._count);
}

const sample = await prisma.notificationTemplate.findMany({
  take: 5,
  orderBy: { key: 'asc' }
});
for (const t of sample) {
  console.log('  ' + t.key + ' -> ' + t.name);
}

await prisma.$disconnect();
