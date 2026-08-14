import { describe, it, expect, beforeAll } from 'vitest';
import { CONTRACT_BASE_URL, LIVE_TESTS_ENABLED } from '../helpers/live-guard.js';

// P59-B 4D + P59-C/LR-2: this is a LIVE test (real fetch to a running backend).
// It MUST target a dedicated test backend (CONTRACT_BASE_URL) and SKIP otherwise,
// otherwise it POSTs test customers/meters into the production DB.
const BASE = CONTRACT_BASE_URL;
async function waitForBackend(r = 5, d = 500) { for (let i = 0; i < r; i++) { try { const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) }); if (res.status === 200) return true } catch {} await new Promise(x => setTimeout(x, d)) } return false }
const ready = LIVE_TESTS_ENABLED ? await waitForBackend() : false;
const dfn = ready ? describe : describe.skip;

// P59: X-Dev-Mode bypass is gated behind ALLOW_DEV_BYPASS=true (off by default).
// These live-API tests must use REAL authentication now.
let AUTH;
beforeAll(async () => {
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meterverse.com', password: 'Admin@123', system_type: 'admin' }),
  });
  const d = await login.json();
  AUTH = { 'Authorization': `Bearer ${d.accessToken}`, 'Content-Type': 'application/json' };
}, 15000);

dfn('Customers API', () => {
  let id;
  it('POST /api/customers â€” 201', async () => {
    const r = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'Test Customer', email: 'test@test.com' }) });
    expect(r.status).toBe(201); const d = await r.json(); id = d.id || d.customer?.id;
  });
  it('GET /api/customers â€” 200 list', async () => {
    const r = await fetch(`${BASE}/api/customers`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
  it('GET /api/customers/:id â€” 200 detail', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/customers/${id}`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
});

dfn('Meters API', () => {
  let id;
  it('POST /api/meters â€” 201', async () => {
    const r = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: 'TST-' + Date.now(), type: 'LP2' }) });
    expect(r.status).toBe(201); const d = await r.json(); id = d.id || d.meter?.id;
  });
  it('GET /api/meters â€” 200 list', async () => {
    const r = await fetch(`${BASE}/api/meters`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
  it('GET /api/meters/:id â€” 200 detail', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/meters/${id}`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
});
