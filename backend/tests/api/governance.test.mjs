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
import { governanceRouter } from '../../src/routes/governance.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

// Authenticated admin user (dev bypass not used here; we inject via JWT mock)
const app = express();
app.use(express.json());
app.use('/api/governance', governanceRouter);
app.use(errorHandler);

function authHeader() {
  return { Authorization: 'Bearer test-token' };
}

describe('C21 governance routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('GET /summary', () => {
    it('returns governance counts', async () => {
      prisma.governanceStandard.count.mockResolvedValue(2);
      prisma.governancePolicy.count.mockResolvedValue(1);
      prisma.governanceDecision.count.mockResolvedValue(3);
      prisma.architectureDecisionRecord.count.mockResolvedValue(1);
      prisma.businessRisk.count.mockResolvedValue(4);
      prisma.governanceAuditFinding.count.mockResolvedValue(2);
      prisma.technicalDebtItem.count.mockResolvedValue(5);
      prisma.complianceObligation.count.mockResolvedValue(8);

      const res = await request(app).get('/api/governance/summary').set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ standards: 2, policies: 1, decisions: 3, adrs: 1, risks: 4, findings: 2, debt: 5, compliance: 8 });
    });
  });

  describe('Standards CRUD', () => {
    it('creates a standard', async () => {
      prisma.governanceStandard.create.mockResolvedValue({ id: 's-1', code: 'ARCH-001', name: 'Test Standard', category: 'ARCHITECTURE', status: 'DRAFT' });
      const res = await request(app)
        .post('/api/governance/standards')
        .set(authHeader())
        .send({ code: 'ARCH-001', name: 'Test Standard', category: 'ARCHITECTURE' });
      expect(res.status).toBe(201);
      expect(res.body.standard.code).toBe('ARCH-001');
    });

    it('rejects invalid standard payload', async () => {
      const res = await request(app).post('/api/governance/standards').set(authHeader()).send({});
      expect(res.status).toBe(400);
    });

    it('lists standards', async () => {
      prisma.governanceStandard.findMany.mockResolvedValue([{ id: 's-1', code: 'ARCH-001' }]);
      prisma.governanceStandard.count.mockResolvedValue(1);
      const res = await request(app).get('/api/governance/standards').set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.standards).toHaveLength(1);
    });
  });

  describe('Policies', () => {
    it('creates a policy', async () => {
      prisma.governancePolicy.create.mockResolvedValue({ id: 'p-1', code: 'POL-001', name: 'Change Mgmt', status: 'DRAFT' });
      const res = await request(app)
        .post('/api/governance/policies')
        .set(authHeader())
        .send({ code: 'POL-001', name: 'Change Mgmt' });
      expect(res.status).toBe(201);
      expect(res.body.policy.code).toBe('POL-001');
    });
  });

  describe('Risks', () => {
    it('creates a risk with inherent score', async () => {
      prisma.businessRisk.create.mockResolvedValue({ id: 'r-1', title: 'Risk', inherentRisk: 12 });
      const res = await request(app)
        .post('/api/governance/risks')
        .set(authHeader())
        .send({ title: 'Risk', likelihood: 3, impact: 4 });
      expect(res.status).toBe(201);
      expect(res.body.risk.inherentRisk).toBe(12);
    });

    it('assesses risk residual', async () => {
      prisma.businessRisk.update.mockResolvedValue({ id: 'r-1', residualRisk: 8, status: 'MITIGATING' });
      const res = await request(app)
        .post('/api/governance/risks/r-1/assess')
        .set(authHeader())
        .send({ residualRisk: 8, status: 'MITIGATING' });
      expect(res.status).toBe(200);
      expect(res.body.risk.residualRisk).toBe(8);
    });
  });

  describe('Compliance', () => {
    it('creates a compliance obligation', async () => {
      prisma.complianceObligation.create.mockResolvedValue({ id: 'c-1', framework: 'ISO27001', controlId: 'A.5.1' });
      const res = await request(app)
        .post('/api/governance/compliance')
        .set(authHeader())
        .send({ controlId: 'A.5.1', controlName: 'Policies' });
      expect(res.status).toBe(201);
      expect(res.body.obligation.framework).toBe('ISO27001');
    });
  });

  describe('Findings', () => {
    it('creates a finding and closes it', async () => {
      prisma.governanceAuditFinding.create.mockResolvedValue({ id: 'f-1', severity: 'HIGH', status: 'OPEN' });
      const create = await request(app)
        .post('/api/governance/findings')
        .set(authHeader())
        .send({ title: 'Finding', severity: 'HIGH' });
      expect(create.status).toBe(201);

      prisma.governanceAuditFinding.update.mockResolvedValue({ id: 'f-1', status: 'CLOSED' });
      const close = await request(app).post('/api/governance/findings/f-1/close').set(authHeader());
      expect(close.status).toBe(200);
      expect(close.body.finding.status).toBe('CLOSED');
    });
  });
});
