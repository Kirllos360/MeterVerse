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
import { documentGovernanceRouter } from '../../src/routes/documents-governance.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/documents-governance', documentGovernanceRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C24 Document Governance routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  it('lists documents', async () => {
    prisma.document.findMany.mockResolvedValue([{ id: 'd-1', title: 'Contract', status: 'PUBLISHED' }]);
    prisma.document.count.mockResolvedValue(1);
    const res = await request(app).get('/api/documents-governance').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.documents).toHaveLength(1);
  });

  it('creates a document with version + tags', async () => {
    prisma.document.create.mockResolvedValue({ id: 'd-1', title: 'Doc', versionNumber: 1 });
    prisma.documentVersion.create.mockResolvedValue({ id: 'v-1' });
    prisma.documentTag.upsert.mockResolvedValue({ id: 't-1' });
    prisma.documentDocumentTag.create.mockResolvedValue({ id: 'dt-1' });
    const res = await request(app)
      .post('/api/documents-governance')
      .set(auth())
      .send({ title: 'Doc', storedFileId: 'sf-1', tags: ['legal'] });
    expect(res.status).toBe(201);
    expect(prisma.documentVersion.create).toHaveBeenCalled();
    expect(prisma.documentTag.upsert).toHaveBeenCalled();
  });

  it('gets a document detail', async () => {
    prisma.document.findUnique.mockResolvedValue({ id: 'd-1', versions: [], tags: [], approvals: [], comments: [] });
    const res = await request(app).get('/api/documents-governance/d-1').set(auth());
    expect(res.status).toBe(200);
  });

  it('updates a document and creates a new version when storedFileId changes', async () => {
    prisma.document.findUnique.mockResolvedValue({ id: 'd-1', versionNumber: 1, title: 'Old' });
    prisma.document.update.mockResolvedValue({ id: 'd-1', versionNumber: 2 });
    prisma.documentVersion.create.mockResolvedValue({ id: 'v-2' });
    const res = await request(app)
      .put('/api/documents-governance/d-1')
      .set(auth())
      .send({ storedFileId: 'sf-2' });
    expect(res.status).toBe(200);
    expect(res.body.document.versionNumber).toBe(2);
  });

  it('approves a document lifecycle', async () => {
    prisma.document.update.mockResolvedValue({ id: 'd-1', status: 'PUBLISHED' });
    prisma.documentApproval.create.mockResolvedValue({ id: 'a-1' });
    const res = await request(app)
      .post('/api/documents-governance/d-1/approve')
      .set(auth())
      .send({ status: 'PUBLISHED' });
    expect(res.status).toBe(200);
    expect(res.body.document.status).toBe('PUBLISHED');
  });

  it('adds a comment', async () => {
    prisma.documentComment.create.mockResolvedValue({ id: 'c-1' });
    const res = await request(app)
      .post('/api/documents-governance/d-1/comment')
      .set(auth())
      .send({ body: 'Looks good' });
    expect(res.status).toBe(201);
  });

  it('creates a category', async () => {
    prisma.documentCategory.create.mockResolvedValue({ id: 'cat-1' });
    const res = await request(app)
      .post('/api/documents-governance/meta/categories')
      .set(auth())
      .send({ name: 'Contracts', code: 'CONTRACT' });
    expect(res.status).toBe(201);
  });

  it('lists retention policies', async () => {
    prisma.retentionPolicy.findMany.mockResolvedValue([{ id: 'r-1', code: 'KEEP_7Y' }]);
    const res = await request(app).get('/api/documents-governance/meta/retention-policies').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.policies).toHaveLength(1);
  });
});
