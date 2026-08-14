import { describe, it, expect, beforeAll } from 'vitest';
import { CONTRACT_BASE_URL, LIVE_TESTS_ENABLED } from '../helpers/live-guard.js';

// P59-B 4D + P59-C/LR-2: LIVE test — must target a dedicated test backend and
// SKIP otherwise, else it POSTs test incidents into the production DB.
const BASE = CONTRACT_BASE_URL;
async function waitForBackend(r = 5, d = 500) { for (let i = 0; i < r; i++) { try { const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) }); if (res.status === 200) return true } catch {} await new Promise(x => setTimeout(x, d)) } return false }
const ready = LIVE_TESTS_ENABLED ? await waitForBackend() : false;
const dfn = ready ? describe : describe.skip;

// P59: X-Dev-Mode bypass gated off - use real auth.
let AUTH;
beforeAll(async () => {
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meterverse.com', password: 'Admin@123', system_type: 'admin' }),
  });
  const d = await login.json();
  AUTH = { 'Authorization': `Bearer ${d.accessToken}`, 'Content-Type': 'application/json' };
}, 15000);

dfn('Incidents API', () => {
  let id;
  it('POST /api/incidents â€” 201 creates incident', async () => {
    const r = await fetch(`${BASE}/api/incidents`, { method: 'POST', headers: AUTH, body: JSON.stringify({ title: 'Test incident', severity: 'P2', category: 'meter' }) });
    expect(r.status).toBe(201); const d = await r.json(); id = d.incident.id;
  });
  it('GET /api/incidents â€” 200 list', async () => {
    const r = await fetch(`${BASE}/api/incidents`, { headers: AUTH });
    expect(r.status).toBe(200); const d = await r.json(); expect(Array.isArray(d.incidents)).toBe(true);
  });
  it('GET /api/incidents/stats â€” 200 stats', async () => {
    const r = await fetch(`${BASE}/api/incidents/stats`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
  it('POST /api/incidents with same fingerprint â€” deduplicates', async () => {
    const fp = 'dup-' + Date.now();
    const r = await fetch(`${BASE}/api/incidents`, { method: 'POST', headers: AUTH, body: JSON.stringify({ title: 'Dup test', severity: 'P3', fingerprint: fp }) });
    expect(r.status).toBe(201);
    const r2 = await fetch(`${BASE}/api/incidents`, { method: 'POST', headers: AUTH, body: JSON.stringify({ title: 'Dup test 2', severity: 'P3', fingerprint: fp }) });
    const d2 = await r2.json();
    expect(d2.deduplicated).toBe(true);
  });
  it('PUT /api/incidents/:id â€” 200 update status', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/incidents/${id}`, { method: 'PUT', headers: AUTH, body: JSON.stringify({ status: 'resolved', resolution: 'Test resolution' }) });
    expect(r.status).toBe(200);
  });
  it('DELETE /api/incidents/:id â€” 200 soft delete', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/incidents/${id}`, { method: 'DELETE', headers: AUTH });
    expect(r.status).toBe(200);
  });
});
