import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});
const jwt = (await import('jsonwebtoken')).default;

process.env.JWT_SECRET = 'test-secret-key';

import request from 'supertest';
import express from 'express';
import { tenantRouter } from '../../src/routes/tenants.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/tenants', tenantRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C22 SaaS & Multi-Tenancy routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('Tenants', () => {
    it('creates a tenant', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue({ id: 't-1', name: 'Acme Utility', slug: 'acme', status: 'TRIAL' });
      const res = await request(app).post('/api/tenants').set(auth()).send({ name: 'Acme Utility', slug: 'acme' });
      expect(res.status).toBe(201);
      expect(res.body.tenant.slug).toBe('acme');
    });

    it('rejects duplicate tenant slug', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 't-1', slug: 'acme' });
      const res = await request(app).post('/api/tenants').set(auth()).send({ name: 'Acme', slug: 'acme' });
      expect(res.status).toBe(409);
    });

    it('rejects invalid payload', async () => {
      const res = await request(app).post('/api/tenants').set(auth()).send({});
      expect(res.status).toBe(400);
    });

    it('lists tenants', async () => {
      prisma.tenant.findMany.mockResolvedValue([{ id: 't-1', name: 'Acme' }]);
      prisma.tenant.count.mockResolvedValue(1);
      const res = await request(app).get('/api/tenants').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.tenants).toHaveLength(1);
    });

    it('gets single tenant with subscriptions', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 't-1', subscriptions: [], settingsEntries: [] });
      const res = await request(app).get('/api/tenants/t-1').set(auth());
      expect(res.status).toBe(200);
    });

    it('archives tenant', async () => {
      prisma.tenant.update.mockResolvedValue({ id: 't-1', status: 'ARCHIVED', lifecycleStatus: 'ARCHIVED' });
      const res = await request(app).post('/api/tenants/t-1/archive').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.tenant.status).toBe('ARCHIVED');
    });
  });

  describe('Tenant settings', () => {
    it('upserts a setting', async () => {
      prisma.tenantSetting.upsert.mockResolvedValue({ id: 's-1', key: 'locale', value: 'ar' });
      const res = await request(app).post('/api/tenants/t-1/settings').set(auth()).send({ key: 'locale', value: 'ar' });
      expect(res.status).toBe(201);
      expect(res.body.setting.value).toBe('ar');
    });

    it('lists settings', async () => {
      prisma.tenantSetting.findMany.mockResolvedValue([{ key: 'locale', value: 'ar' }]);
      const res = await request(app).get('/api/tenants/t-1/settings').set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('Subscription plans', () => {
    it('creates a plan', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.create.mockResolvedValue({ id: 'p-1', code: 'STARTER', tier: 'STARTER' });
      const res = await request(app).post('/api/tenants/plans').set(auth()).send({ name: 'Starter', code: 'STARTER' });
      expect(res.status).toBe(201);
    });

    it('lists plans', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([{ code: 'STARTER' }]);
      const res = await request(app).get('/api/tenants/plans').set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('Tenant subscriptions', () => {
    it('creates a subscription and provisions tenant', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue({ id: 'p-1', priceMonthly: 500 });
      prisma.tenantSubscription.create.mockResolvedValue({ id: 'sub-1', status: 'TRIAL' });
      prisma.tenant.update.mockResolvedValue({ id: 't-1', lifecycleStatus: 'PROVISIONED' });
      const res = await request(app)
        .post('/api/tenants/subscriptions')
        .set(auth())
        .send({ tenantId: '11111111-1111-1111-1111-111111111111', planId: '22222222-2222-2222-2222-222222222222' });
      expect(res.status).toBe(201);
      expect(prisma.tenant.update).toHaveBeenCalled();
    });

    it('updates subscription status', async () => {
      prisma.tenantSubscription.update.mockResolvedValue({ id: 'sub-1', status: 'ACTIVE' });
      const res = await request(app).post('/api/tenants/subscriptions/sub-1/status').set(auth()).send({ status: 'ACTIVE' });
      expect(res.status).toBe(200);
    });
  });

  describe('Usage metering', () => {
    it('records usage (upsert increments)', async () => {
      prisma.usageMeter.upsert.mockResolvedValue({ id: 'u-1', quantity: 10 });
      const res = await request(app)
        .post('/api/tenants/usage')
        .set(auth())
        .send({ tenantId: '11111111-1111-1111-1111-111111111111', metric: 'API_CALLS', quantity: 10, periodStart: '2026-08-01', periodEnd: '2026-08-31' });
      expect(res.status).toBe(201);
    });
  });

  describe('Environments', () => {
    it('creates environment profile', async () => {
      prisma.environmentProfile.findUnique.mockResolvedValue(null);
      prisma.environmentProfile.create.mockResolvedValue({ id: 'e-1', code: 'DEV' });
      const res = await request(app).post('/api/tenants/environments').set(auth()).send({ name: 'Development', code: 'DEV' });
      expect(res.status).toBe(201);
    });
  });

  describe('Summary', () => {
    it('returns tenant summary counts', async () => {
      prisma.tenant.count.mockResolvedValue(5);
      prisma.tenantSubscription.count.mockResolvedValue(3);
      prisma.subscriptionPlan.count.mockResolvedValue(2);
      prisma.usageMeter.count.mockResolvedValue(50);
      const res = await request(app).get('/api/tenants/summary/overview').set(auth());
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ tenants: 5, subscriptions: 3, plans: 2, usage: 50 });
    });
  });
});
