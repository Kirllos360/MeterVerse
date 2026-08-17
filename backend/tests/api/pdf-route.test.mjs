import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/middleware/security.js', async (orig) => {
  const mod = await orig();
  return { ...mod, auditLog: vi.fn() };
});
vi.mock('../../src/services/posting-engine.js', () => ({ postEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/services/pdf-engine.js', () => ({
  generateInvoicePdf: vi.fn().mockResolvedValue({ filepath: 'x.pdf', filename: 'invoice-SOLAR-52051449-2021-01.pdf' }),
  generateStatementPdf: vi.fn().mockResolvedValue({ filepath: 'x.pdf', filename: 'statement-c-1.pdf' }),
}));
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});

const jwt = (await import('jsonwebtoken')).default;
process.env.JWT_SECRET = 'test-secret-key';

import request from 'supertest';
import express from 'express';
import { pdfRouter } from '../../src/routes/pdf.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/pdf', pdfRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('P13.7 pdf route (HTTP surface for document generation)', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
  });

  it('POST /api/pdf/invoices/:id generates an invoice PDF (200)', async () => {
    prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', number: 'SOLAR-52051449-2021-01', customer: { id: 'c-1', name: 'Ihab Shafie' } });
    const res = await request(app).post('/api/pdf/invoices/inv-1').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.file).toBe('invoice-SOLAR-52051449-2021-01.pdf');
  });

  it('POST /api/pdf/invoices/:id returns 404 for unknown invoice', async () => {
    prisma.invoice.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/pdf/invoices/ghost').set(auth());
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('POST /api/pdf/statements/:customerId generates a statement PDF (200)', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'Ihab Shafie' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 36.1 }]);
    prisma.payment.findMany.mockResolvedValue([]);
    const res = await request(app).post('/api/pdf/statements/c-1').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.file).toBe('statement-c-1.pdf');
  });

  it('POST /api/pdf/statements/:customerId returns 404 for unknown customer', async () => {
    prisma.customer.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/pdf/statements/ghost').set(auth());
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('denies unauthenticated access (401)', async () => {
    const res = await request(app).post('/api/pdf/invoices/inv-1');
    expect(res.status).toBe(401);
  });
});