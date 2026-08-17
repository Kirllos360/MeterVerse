import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { correlationMiddleware } from '../../src/middleware/errorHandler.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

function makeApp() {
  const app = express();
  app.use(correlationMiddleware);
  app.get('/probe', (req, res) => res.json({ correlationId: req.correlationId, requestId: req.requestId, causationId: req.causationId || null }));
  return app;
}

describe('P12.2-B correlation middleware (server-authoritative, P12-02-05)', () => {
  let app;
  beforeEach(() => { app = makeApp(); });

  it('1. preserves a valid client X-Correlation-ID (UUID)', async () => {
    const res = await request(app).get('/probe').set('X-Correlation-ID', VALID);
    expect(res.status).toBe(200);
    expect(res.body.correlationId).toBe(VALID);
    expect(res.headers['x-correlation-id']).toBe(VALID);
  });

  it('2. regenerates an invalid (truncated/spoofed) client X-Correlation-ID (server-authoritative)', async () => {
    const res = await request(app).get('/probe').set('X-Correlation-ID', 'abc123');
    expect(res.status).toBe(200);
    expect(res.body.correlationId).not.toBe('abc123');
    expect(UUID_RE.test(res.body.correlationId)).toBe(true);
  });

  it('3. generates a full UUID correlationId when header absent', async () => {
    const res = await request(app).get('/probe');
    expect(res.status).toBe(200);
    expect(UUID_RE.test(res.body.correlationId)).toBe(true);
    expect(res.body.correlationId.length).toBe(36); // full UUID, not a truncated slice
  });

  it('4. sets X-Request-ID (full UUID) and X-Correlation-ID response headers', async () => {
    const res = await request(app).get('/probe');
    expect(UUID_RE.test(res.headers['x-request-id'])).toBe(true);
    expect(UUID_RE.test(res.headers['x-correlation-id'])).toBe(true);
  });

  it('5. passes through a valid X-Causation-ID for event parent linkage', async () => {
    const res = await request(app).get('/probe').set('X-Causation-ID', VALID);
    expect(res.status).toBe(200);
    expect(res.body.causationId).toBe(VALID);
    expect(res.headers['x-causation-id']).toBe(VALID);
  });

  it('6. ignores an invalid X-Causation-ID', async () => {
    const res = await request(app).get('/probe').set('X-Causation-ID', 'spoof');
    expect(res.status).toBe(200);
    expect(res.body.causationId).toBeNull();
    expect(res.headers['x-causation-id']).toBeUndefined();
  });

  it('7. propagates correlationId to downstream middleware/route via req', async () => {
    const seen = [];
    const app2 = express();
    app2.use(correlationMiddleware);
    app2.use((req, res, next) => { seen.push(req.correlationId); next(); });
    app2.get('/x', (req, res) => res.json({ ok: true }));
    const res = await request(app2).get('/x');
    expect(res.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(UUID_RE.test(seen[0])).toBe(true);
  });
});