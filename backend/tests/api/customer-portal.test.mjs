import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});
const jwt = (await import('jsonwebtoken')).default;

process.env.JWT_SECRET = 'test-secret-key';

import request from 'supertest';
import express from 'express';
import { customerPortalRouter } from '../../src/routes/customer-portal.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/portal', customerPortalRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }
const CID = 'c-1';

describe('C14 Customer Portal routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  it('upserts customer preferences', async () => {
    prisma.customerPreference.upsert.mockResolvedValue({ id: 'p-1', language: 'ar' });
    const res = await request(app).put(`/api/portal/customers/${CID}/preferences`).set(auth()).send({ language: 'ar', theme: 'zen' });
    expect(res.status).toBe(200);
    expect(res.body.preference.language).toBe('ar');
  });

  it('lists delegated access', async () => {
    prisma.delegatedAccess.findMany.mockResolvedValue([{ id: 'd-1', delegateEmail: 'm@x.com' }]);
    const res = await request(app).get(`/api/portal/customers/${CID}/delegated`).set(auth());
    expect(res.status).toBe(200);
  });

  it('creates delegated access', async () => {
    prisma.delegatedAccess.create.mockResolvedValue({ id: 'd-1' });
    const res = await request(app).post(`/api/portal/customers/${CID}/delegated`).set(auth()).send({ delegateEmail: 'm@x.com' });
    expect(res.status).toBe(201);
  });

  it('lists service requests', async () => {
    prisma.serviceRequest.findMany.mockResolvedValue([{ id: 'r-1', subject: 'S1', messages: [] }]);
    const res = await request(app).get(`/api/portal/customers/${CID}/requests`).set(auth());
    expect(res.status).toBe(200);
  });

  it('creates a service request with initial message', async () => {
    prisma.serviceRequest.create.mockResolvedValue({ id: 'r-1' });
    prisma.serviceRequestMessage.create.mockResolvedValue({ id: 'm-1' });
    const res = await request(app).post(`/api/portal/customers/${CID}/requests`).set(auth()).send({ type: 'BILLING', subject: 'Q', description: 'Body' });
    expect(res.status).toBe(201);
    expect(prisma.serviceRequestMessage.create).toHaveBeenCalled();
  });

  it('creates a ticket', async () => {
    prisma.ticket.create.mockResolvedValue({ id: 't-1', subject: 'Ticket' });
    const res = await request(app).post(`/api/portal/customers/${CID}/tickets`).set(auth()).send({ subject: 'Ticket', category: 'SUPPORT' });
    expect(res.status).toBe(201);
  });

  it('lists tickets', async () => {
    prisma.ticket.findMany.mockResolvedValue([{ id: 't-1' }]);
    const res = await request(app).get(`/api/portal/customers/${CID}/tickets`).set(auth());
    expect(res.status).toBe(200);
  });

  it('lists customer documents', async () => {
    prisma.customerDocument.findMany.mockResolvedValue([{ id: 'cd-1', title: 'Statement' }]);
    const res = await request(app).get(`/api/portal/customers/${CID}/documents`).set(auth());
    expect(res.status).toBe(200);
  });

  it('builds a customer timeline', async () => {
    prisma.invoice.findMany.mockResolvedValue([]);
    prisma.payment.findMany.mockResolvedValue([]);
    prisma.serviceRequest.findMany.mockResolvedValue([]);
    prisma.ticket.findMany.mockResolvedValue([]);
    prisma.auditEntry.findMany.mockResolvedValue([]);
    const res = await request(app).get(`/api/portal/customers/${CID}/timeline`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('invoices');
    expect(res.body).toHaveProperty('audit');
  });
});
