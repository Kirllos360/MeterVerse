vi.mock('../../src/db.js', async () => {
  const { prisma } = await import('../helpers/mock-prisma.js');
  return { prisma };
});
vi.mock('../../src/server.js', async () => {
  const { prisma } = await import('../helpers/mock-prisma.js');
  return { prisma };
});
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
