import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/services/logger.js', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/middleware/security.js', async (orig) => {
  const mod = await orig();
  return { ...mod, auditLog: vi.fn() };
});
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});

const jwt = (await import('jsonwebtoken')).default;
process.env.JWT_SECRET = 'test-secret-key';

import request from 'supertest';
import express from 'express';
import { ingestionRouter } from '../../src/routes/ingestion.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/ingestion', ingestionRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('P60.6 ingestion route (SEP/Symbiot bridge HTTP surface)', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
  });

  it('GET /api/ingestion/status returns bridge + poller status', async () => {
    const res = await request(app).get('/api/ingestion/status').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bridge');
    expect(res.body).toHaveProperty('pollers');
  });

  it('POST /api/ingestion/test-push persists a valid reading (201)', async () => {
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-1', serial: 'SEP-1', areaId: null, projectId: null });
    prisma.reading.create.mockResolvedValue({ id: 'r-1', meterId: 'm-1', value: 9 });
    const res = await request(app).post('/api/ingestion/test-push').set(auth()).send({ meter: 'SEP-1', value: 9 });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  it('POST test-push rejects unknown meter (400, no fabrication)', async () => {
    prisma.meter.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/ingestion/test-push').set(auth()).send({ meter: 'GHOST', value: 9 });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('UNKNOWN_METER');
  });

  it('POST test-push validates required fields (400)', async () => {
    const res = await request(app).post('/api/ingestion/test-push').set(auth()).send({ value: 9 });
    expect(res.status).toBe(400);
  });

  it('denies unauthenticated access (401)', async () => {
    const res = await request(app).get('/api/ingestion/status');
    expect(res.status).toBe(401);
  });
});
