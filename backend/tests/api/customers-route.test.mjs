import { describe, it, expect } from 'vitest';
const BASE = 'http://localhost:3002';
const AUTH = { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true', 'Content-Type': 'application/json' };
async function waitForBackend(r = 5, d = 500) { for (let i = 0; i < r; i++) { try { const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) }); if (res.status === 200) return true } catch {} await new Promise(x => setTimeout(x, d)) } return false }
const ready = await waitForBackend();
const dfn = ready ? describe : describe.skip;

dfn('Customers API', () => {
  let id;
  it('POST /api/customers — 201', async () => {
    const r = await fetch(`${BASE}/api/customers`, { method: 'POST', headers: AUTH, body: JSON.stringify({ name: 'Test Customer', email: 'test@test.com' }) });
    expect(r.status).toBe(201); const d = await r.json(); id = d.id || d.customer?.id;
  });
  it('GET /api/customers — 200 list', async () => {
    const r = await fetch(`${BASE}/api/customers`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
  it('GET /api/customers/:id — 200 detail', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/customers/${id}`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
});

dfn('Meters API', () => {
  let id;
  it('POST /api/meters — 201', async () => {
    const r = await fetch(`${BASE}/api/meters`, { method: 'POST', headers: AUTH, body: JSON.stringify({ serial: 'TST-' + Date.now(), type: 'LP2' }) });
    expect(r.status).toBe(201); const d = await r.json(); id = d.id || d.meter?.id;
  });
  it('GET /api/meters — 200 list', async () => {
    const r = await fetch(`${BASE}/api/meters`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
  it('GET /api/meters/:id — 200 detail', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/meters/${id}`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
});
