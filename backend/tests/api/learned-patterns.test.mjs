import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../helpers/setup.js';

const BASE = 'http://localhost:3131';
const AUTH = { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true', 'Content-Type': 'application/json' };

async function waitForBackend(retries = 10, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (r.status === 200) return true;
    } catch {}
    await new Promise(r => setTimeout(r, delay));
  }
  return false;
}
const backendReady = await waitForBackend(5, 500);
const describeFn = backendReady ? describe : describe.skip;

describeFn('LearnedPatterns API', () => {
  let patternId;

  it('POST /api/learned-patterns â€” 201 create', async () => {
    const r = await fetch(`${BASE}/api/learned-patterns`, {
      method: 'POST', headers: AUTH,
      body: JSON.stringify({ pattern: 'Meter offline after SIM cooldown', resolution: 'Replace SIM and reset meter', tags: '["meter","sim"]' }),
    });
    expect(r.status).toBe(201);
    const d = await r.json();
    expect(d.pattern).toBeDefined();
    expect(d.pattern.id).toBeDefined();
    patternId = d.pattern.id;
  });

  it('GET /api/learned-patterns â€” 200 list', async () => {
    const r = await fetch(`${BASE}/api/learned-patterns`, { headers: AUTH });
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(Array.isArray(d.patterns)).toBe(true);
    expect(d.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/learned-patterns/:id â€” 200 detail', async () => {
    const r = await fetch(`${BASE}/api/learned-patterns/${patternId}`, { headers: AUTH });
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.pattern.id).toBe(patternId);
  });

  it('PUT /api/learned-patterns/:id â€” 200 update', async () => {
    const r = await fetch(`${BASE}/api/learned-patterns/${patternId}`, {
      method: 'PUT', headers: AUTH,
      body: JSON.stringify({ effectiveness: 0.85 }),
    });
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.pattern.effectiveness).toBe(0.85);
  });

  it('POST /api/learned-patterns/:id/feedback â€” 200 feedback', async () => {
    const r = await fetch(`${BASE}/api/learned-patterns/${patternId}/feedback`, {
      method: 'POST', headers: AUTH,
      body: JSON.stringify({ effectiveness: 0.9 }),
    });
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.pattern.frequency).toBeGreaterThanOrEqual(2);
  });

  it('DELETE /api/learned-patterns/:id â€” 200 soft delete', async () => {
    const r = await fetch(`${BASE}/api/learned-patterns/${patternId}`, { method: 'DELETE', headers: AUTH });
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.ok).toBe(true);
  });
});
