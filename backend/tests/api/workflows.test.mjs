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
import { workflowRouter } from '../../src/routes/workflows.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/workflows', workflowRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C23 Workflow/BPM routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('Definitions', () => {
    it('creates a workflow definition', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue(null);
      prisma.workflowDefinition.create.mockResolvedValue({ id: 'd-1', code: 'BILLING_APPROVE', status: 'DRAFT' });
      const res = await request(app).post('/api/workflows/definitions').set(auth()).send({ code: 'BILLING_APPROVE', name: 'Billing Approval' });
      expect(res.status).toBe(201);
    });

    it('rejects duplicate code', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue({ id: 'd-1', code: 'BILLING_APPROVE' });
      const res = await request(app).post('/api/workflows/definitions').set(auth()).send({ code: 'BILLING_APPROVE', name: 'Billing Approval' });
      expect(res.status).toBe(409);
    });

    it('rejects invalid payload', async () => {
      const res = await request(app).post('/api/workflows/definitions').set(auth()).send({});
      expect(res.status).toBe(400);
    });

    it('lists definitions', async () => {
      prisma.workflowDefinition.findMany.mockResolvedValue([{ id: 'd-1', code: 'BILLING_APPROVE' }]);
      prisma.workflowDefinition.count.mockResolvedValue(1);
      const res = await request(app).get('/api/workflows/definitions').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.definitions).toHaveLength(1);
    });
  });

  describe('Versions', () => {
    it('creates version 1 for a definition', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue({ id: 'd-1', code: 'BILLING_APPROVE' });
      prisma.workflowVersion.findFirst.mockResolvedValue(null);
      prisma.workflowVersion.create.mockResolvedValue({ id: 'v-1', versionNumber: 1 });
      const res = await request(app).post('/api/workflows/definitions/d-1/versions').set(auth()).send({ nodes: '[]', edges: '[]' });
      expect(res.status).toBe(201);
      expect(res.body.version.versionNumber).toBe(1);
    });

    it('increments version number', async () => {
      prisma.workflowDefinition.findUnique.mockResolvedValue({ id: 'd-1' });
      prisma.workflowVersion.findFirst.mockResolvedValue({ versionNumber: 2 });
      prisma.workflowVersion.create.mockResolvedValue({ id: 'v-3', versionNumber: 3 });
      const res = await request(app).post('/api/workflows/definitions/d-1/versions').set(auth()).send({});
      expect(res.status).toBe(201);
      expect(res.body.version.versionNumber).toBe(3);
    });

    it('approves a version', async () => {
      prisma.workflowVersion.update.mockResolvedValue({ id: 'v-1', status: 'ACTIVE', versionNumber: 1 });
      const res = await request(app).post('/api/workflows/versions/v-1/approve').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.version.status).toBe('ACTIVE');
    });
  });

  describe('Instances', () => {
    it('starts an instance from ACTIVE version', async () => {
      prisma.workflowVersion.findUnique.mockResolvedValue({ id: 'v-1', status: 'ACTIVE' });
      prisma.workflowInstance.create.mockResolvedValue({ id: 'i-1', status: 'RUNNING' });
      const res = await request(app)
        .post('/api/workflows/instances')
        .set(auth())
        .send({ versionId: '11111111-1111-1111-1111-111111111111' });
      expect(res.status).toBe(201);
    });

    it('rejects start from non-ACTIVE version', async () => {
      prisma.workflowVersion.findUnique.mockResolvedValue({ id: 'v-1', status: 'DRAFT' });
      const res = await request(app)
        .post('/api/workflows/instances')
        .set(auth())
        .send({ versionId: '11111111-1111-1111-1111-111111111111' });
      expect(res.status).toBe(400);
    });

    it('updates instance status', async () => {
      prisma.workflowInstance.update.mockResolvedValue({ id: 'i-1', status: 'COMPLETED' });
      const res = await request(app).post('/api/workflows/instances/i-1/status').set(auth()).send({ status: 'COMPLETED' });
      expect(res.status).toBe(200);
      expect(res.body.instance.status).toBe('COMPLETED');
    });

    it('lists instances', async () => {
      prisma.workflowInstance.findMany.mockResolvedValue([{ id: 'i-1' }]);
      prisma.workflowInstance.count.mockResolvedValue(1);
      const res = await request(app).get('/api/workflows/instances').set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('Tasks', () => {
    it('creates a task on instance', async () => {
      prisma.workflowTask.create.mockResolvedValue({ id: 't-1', title: 'Review' });
      const res = await request(app).post('/api/workflows/instances/i-1/tasks').set(auth()).send({ title: 'Review' });
      expect(res.status).toBe(201);
    });

    it('completes a task', async () => {
      prisma.workflowTask.update.mockResolvedValue({ id: 't-1', status: 'COMPLETED' });
      const res = await request(app).post('/api/workflows/tasks/t-1/complete').set(auth()).send({ result: 'ok' });
      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('COMPLETED');
    });
  });

  describe('Approvals', () => {
    it('requests an approval', async () => {
      prisma.approvalRequest.create.mockResolvedValue({ id: 'a-1', status: 'PENDING' });
      const res = await request(app).post('/api/workflows/instances/i-1/approvals').set(auth()).send({ title: 'Approve invoice' });
      expect(res.status).toBe(201);
    });

    it('decides an approval', async () => {
      prisma.approvalRequest.findUnique.mockResolvedValue({ id: 'a-1', status: 'PENDING' });
      prisma.approvalDecision.create.mockResolvedValue({ id: 'ad-1', decision: 'APPROVE' });
      prisma.approvalRequest.update.mockResolvedValue({ id: 'a-1', status: 'APPROVED' });
      const res = await request(app).post('/api/workflows/approvals/a-1/decide').set(auth()).send({ decision: 'APPROVE' });
      expect(res.status).toBe(200);
      expect(res.body.approval.status).toBe('APPROVED');
    });

    it('rejects invalid decision', async () => {
      const res = await request(app).post('/api/workflows/approvals/a-1/decide').set(auth()).send({ decision: 'UNKNOWN' });
      expect(res.status).toBe(400);
    });
  });

  describe('Summary', () => {
    it('returns workflow summary', async () => {
      prisma.workflowDefinition.count.mockResolvedValue(3);
      prisma.workflowVersion.count.mockResolvedValue(5);
      prisma.workflowInstance.count.mockResolvedValue(10);
      prisma.workflowTask.count.mockResolvedValue(20);
      prisma.approvalRequest.count.mockResolvedValue(4);
      const res = await request(app).get('/api/workflows/summary/overview').set(auth());
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ definitions: 3, versions: 5, instances: 10, tasks: 20, approvals: 4 });
    });
  });
});
