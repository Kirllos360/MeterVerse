import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/middleware/security.js', async (orig) => {
  const mod = await orig();
  return { ...mod, auditLog: vi.fn() };
});
vi.mock('../../src/services/posting-engine.js', () => ({ postEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});

const jwt = (await import('jsonwebtoken')).default;
process.env.JWT_SECRET = 'test-secret-key';

import request from 'supertest';
import express from 'express';
import { chequeRouter } from '../../src/routes/cheque.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/cheques', chequeRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('P60.4 cheque route (HTTP surface for the cheque engine)', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
  });

  it('creates a cheque payment via POST /api/cheques', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'C' });
    prisma.payment.create.mockResolvedValue({ id: 'p-1', customerId: 'c-1', amount: 100, method: 'cheque', status: 'pending', reference: 'CHQ-1', paidAt: null });
    const res = await request(app).post('/api/cheques').set(auth()).send({ customerId: 'c-1', amount: 100, chequeNumber: 'CHQ-1', bankName: 'NBE' });
    expect(res.status).toBe(201);
    expect(res.body.cheque.status).toBe('pending');
    expect(res.body.cheque.method).toBe('cheque');
  });

  it('rejects create with missing chequeNumber (400)', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    const res = await request(app).post('/api/cheques').set(auth()).send({ customerId: 'c-1', amount: 100 });
    expect(res.status).toBe(400);
  });

  it('rejects create for unknown customer (404)', async () => {
    prisma.customer.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/cheques').set(auth()).send({ customerId: 'ghost', amount: 100, chequeNumber: 'CHQ-2' });
    expect(res.status).toBe(404);
  });

  it('clears a cheque via POST /api/cheques/:id/clear', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p-1', method: 'cheque', status: 'pending' });
    prisma.payment.update.mockResolvedValue({ id: 'p-1', method: 'cheque', status: 'completed', paidAt: new Date() });
    const res = await request(app).post('/api/cheques/p-1/clear').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.cheque.status).toBe('completed');
  });

  it('rejects clear for a non-cheque payment (400)', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p-1', method: 'cash', status: 'completed' });
    const res = await request(app).post('/api/cheques/p-1/clear').set(auth());
    expect(res.status).toBe(400);
  });

  it('rejects a cheque via POST /api/cheques/:id/reject with reason', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p-1', method: 'cheque', status: 'pending' });
    prisma.payment.update.mockResolvedValue({ id: 'p-1', method: 'cheque', status: 'rejected', notes: 'rejected: NSF' });
    const res = await request(app).post('/api/cheques/p-1/reject').set(auth()).send({ reason: 'NSF' });
    expect(res.status).toBe(200);
    expect(res.body.cheque.status).toBe('rejected');
  });

  it('lists cheque payments via GET /api/cheques', async () => {
    prisma.payment.findMany.mockResolvedValue([{ id: 'p-1', method: 'cheque', status: 'pending' }]);
    prisma.payment.count.mockResolvedValue(1);
    const res = await request(app).get('/api/cheques').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.cheques).toHaveLength(1);
  });

  it('denies unauthenticated access (401)', async () => {
    const res = await request(app).get('/api/cheques');
    expect(res.status).toBe(401);
  });
});
