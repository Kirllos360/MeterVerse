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
import { communicationRouter } from '../../src/routes/communication.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/communication', communicationRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C25 Communication routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  it('lists conversations', async () => {
    prisma.conversation.findMany.mockResolvedValue([{ id: 'c-1', subject: 'Inquiry', messages: [] }]);
    prisma.conversation.count.mockResolvedValue(1);
    const res = await request(app).get('/api/communication/conversations').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(1);
  });

  it('creates a conversation with initial message', async () => {
    prisma.conversation.create.mockResolvedValue({ id: 'c-1', subject: 'Inquiry' });
    prisma.message.create.mockResolvedValue({ id: 'm-1' });
    const res = await request(app)
      .post('/api/communication/conversations')
      .set(auth())
      .send({ subject: 'Inquiry', type: 'CUSTOMER', body: 'Hello' });
    expect(res.status).toBe(201);
    expect(prisma.message.create).toHaveBeenCalled();
  });

  it('gets messages for a conversation', async () => {
    prisma.message.findMany.mockResolvedValue([{ id: 'm-1', body: 'Hi' }]);
    const res = await request(app).get('/api/communication/conversations/c-1/messages').set(auth());
    expect(res.status).toBe(200);
  });

  it('adds a message and activates the conversation', async () => {
    prisma.message.create.mockResolvedValue({ id: 'm-2' });
    prisma.conversation.update.mockResolvedValue({ id: 'c-1', status: 'ACTIVE' });
    const res = await request(app)
      .post('/api/communication/conversations/c-1/messages')
      .set(auth())
      .send({ body: 'Reply' });
    expect(res.status).toBe(201);
  });

  it('updates conversation status', async () => {
    prisma.conversation.update.mockResolvedValue({ id: 'c-1', status: 'CLOSED' });
    const res = await request(app).patch('/api/communication/conversations/c-1').set(auth()).send({ status: 'CLOSED' });
    expect(res.status).toBe(200);
  });

  it('creates a delivery attempt', async () => {
    prisma.deliveryAttempt.create.mockResolvedValue({ id: 'd-1', channel: 'email' });
    const res = await request(app)
      .post('/api/communication/deliveries')
      .set(auth())
      .send({ channel: 'email', recipient: 'a@b.com' });
    expect(res.status).toBe(201);
  });

  it('lists delivery attempts', async () => {
    prisma.deliveryAttempt.findMany.mockResolvedValue([{ id: 'd-1', channel: 'sms', status: 'SENT' }]);
    prisma.deliveryAttempt.count.mockResolvedValue(1);
    const res = await request(app).get('/api/communication/deliveries').set(auth());
    expect(res.status).toBe(200);
  });

  it('upserts notification preference', async () => {
    prisma.notificationPreference.upsert.mockResolvedValue({ id: 'p-1', category: 'billing' });
    const res = await request(app)
      .post('/api/communication/preferences')
      .set(auth())
      .send({ category: 'billing', channels: ['in_app', 'email'] });
    expect(res.status).toBe(200);
    expect(res.body.preference.category).toBe('billing');
  });
});
