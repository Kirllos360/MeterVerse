import { describe, it, expect } from 'vitest';
const BASE = 'http://localhost:3002';
const AUTH = { 'Authorization': 'Bearer dev', 'X-Dev-Mode': 'true', 'Content-Type': 'application/json' };
async function waitForBackend(r = 5, d = 500) { for (let i = 0; i < r; i++) { try { const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) }); if (res.status === 200) return true } catch {} await new Promise(x => setTimeout(x, d)) } return false }
const ready = await waitForBackend();
const dfn = ready ? describe : describe.skip;

dfn('Incidents API', () => {
  let id;
  it('POST /api/incidents — 201 creates incident', async () => {
    const r = await fetch(`${BASE}/api/incidents`, { method: 'POST', headers: AUTH, body: JSON.stringify({ title: 'Test incident', severity: 'P2', category: 'meter' }) });
    expect(r.status).toBe(201); const d = await r.json(); id = d.incident.id;
  });
  it('GET /api/incidents — 200 list', async () => {
    const r = await fetch(`${BASE}/api/incidents`, { headers: AUTH });
    expect(r.status).toBe(200); const d = await r.json(); expect(Array.isArray(d.incidents)).toBe(true);
  });
  it('GET /api/incidents/stats — 200 stats', async () => {
    const r = await fetch(`${BASE}/api/incidents/stats`, { headers: AUTH });
    expect(r.status).toBe(200);
  });
  it('POST /api/incidents with same fingerprint — deduplicates', async () => {
    const fp = 'dup-' + Date.now();
    const r = await fetch(`${BASE}/api/incidents`, { method: 'POST', headers: AUTH, body: JSON.stringify({ title: 'Dup test', severity: 'P3', fingerprint: fp }) });
    expect(r.status).toBe(201);
    const r2 = await fetch(`${BASE}/api/incidents`, { method: 'POST', headers: AUTH, body: JSON.stringify({ title: 'Dup test 2', severity: 'P3', fingerprint: fp }) });
    const d2 = await r2.json();
    expect(d2.deduplicated).toBe(true);
  });
  it('PUT /api/incidents/:id — 200 update status', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/incidents/${id}`, { method: 'PUT', headers: AUTH, body: JSON.stringify({ status: 'resolved', resolution: 'Test resolution' }) });
    expect(r.status).toBe(200);
  });
  it('DELETE /api/incidents/:id — 200 soft delete', async () => {
    if (!id) return; const r = await fetch(`${BASE}/api/incidents/${id}`, { method: 'DELETE', headers: AUTH });
    expect(r.status).toBe(200);
  });
});
