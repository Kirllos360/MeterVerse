import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));

const { computeSolar, persistSolarInvoice, SOLAR_TARIFF_TIERS, SOLAR_SERVICE_FEE } = await import('../../src/services/solar-wallet-engine.js');

describe('P59-C/LR-5 solar wallet engine (recovered legacy rules, MeterVerse-native)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('1. import only: consumption with no production', () => {
    const r = computeSolar({ curr180: 200, prev180: 100 });
    expect(r.consumption).toBe(100);
    expect(r.production).toBe(0);
    expect(r.net).toBe(100);
    expect(r.surplus).toBe(0);
    expect(r.amount).toBe(50 * 0.48 + 50 * 0.58); // 53
    expect(r.total).toBeCloseTo(53 + 1.06 + 9.10, 2);
  });

  it('2. export only: production with no consumption', () => {
    const r = computeSolar({ curr280: 150, prev280: 50 });
    expect(r.consumption).toBe(0);
    expect(r.production).toBe(100);
    expect(r.net).toBe(0);
    expect(r.surplus).toBe(100);
    expect(r.walletCredit).toBe(100);
    expect(r.total).toBeCloseTo(9.10, 2); // no energy, only service fee
  });

  it('3. import > export: net consumption', () => {
    const r = computeSolar({ curr180: 250, prev180: 100, curr280: 180, prev280: 50 });
    expect(r.consumption).toBe(150);
    expect(r.production).toBe(130);
    expect(r.net).toBe(20);
    expect(r.surplus).toBe(0);
    expect(r.amount).toBe(20 * 0.48);
  });

  it('4. export > import: surplus wallet credit', () => {
    const r = computeSolar({ curr180: 150, prev180: 100, curr280: 200, prev280: 50 });
    expect(r.consumption).toBe(50);
    expect(r.production).toBe(150);
    expect(r.net).toBe(0);
    expect(r.surplus).toBe(100);
    expect(r.walletCredit).toBe(100);
  });

  it('5. equal import/export: zero net, zero surplus', () => {
    const r = computeSolar({ curr180: 200, prev180: 100, curr280: 150, prev280: 50 });
    expect(r.net).toBe(0);
    expect(r.surplus).toBe(0);
    expect(r.total).toBeCloseTo(9.10, 2);
  });

  it('6. tariff boundary: exactly 50', () => {
    const r = computeSolar({ curr180: 150, prev180: 100 });
    expect(r.amount).toBe(50 * 0.48);
  });

  it('7. multiple tariff tiers: 150 matches VERIFIED legacy runtime (50@0.48 + 100@0.58 = 82)', () => {
    // Evidence: legacy routes_admin.py computes chunk=min(remaining,limit) against
    // CUMULATIVE limits, so 150 -> 50@0.48 + 100@0.58 = 82 (not band-perfect 87).
    // We reproduce the proven runtime behavior exactly.
    const r = computeSolar({ curr180: 250, prev180: 100 });
    expect(r.amount).toBe(50 * 0.48 + 100 * 0.58);
    expect(r.amount).toBeCloseTo(82, 2);
  });

  it('8. zero energy', () => {
    const r = computeSolar({});
    expect(r.net).toBe(0);
    expect(r.amount).toBe(0);
    expect(r.total).toBeCloseTo(9.10, 2);
  });

  it('9. repeated calculation is deterministic (pure)', () => {
    const a = computeSolar({ curr180: 250, prev180: 100, curr280: 100, prev280: 50 });
    const b = computeSolar({ curr180: 250, prev180: 100, curr280: 100, prev280: 50 });
    expect(a).toEqual(b);
  });

  it('10. wallet credit equals surplus', () => {
    const r = computeSolar({ curr280: 200, prev280: 50 });
    expect(r.walletCredit).toBe(150);
  });

  it('11. negative inputs clamped to zero', () => {
    const r = computeSolar({ curr180: 50, prev180: 100, curr280: 20, prev280: 80 });
    expect(r.consumption).toBe(0);
    expect(r.production).toBe(0);
    expect(r.net).toBe(0);
  });

  it('12. persistSolarInvoice writes ledger credit when surplus > 0', async () => {
    prisma.customerLedgerEntry.create.mockResolvedValue({});
    prisma.invoice.create.mockResolvedValue({ id: 'inv-1' });
    prisma.invoiceItem.create.mockResolvedValue({});
    const r = computeSolar({ curr280: 150, prev280: 50 });
    await persistSolarInvoice({ customerId: 'c-1', result: r, meta: { month: '2026-03' } });
    expect(prisma.customerLedgerEntry.create).toHaveBeenCalledTimes(1);
    expect(prisma.customerLedgerEntry.create.mock.calls[0][0].data.type).toBe('solar_credit');
  });

  it('13. persistSolarInvoice builds invoice with itemized charges', async () => {
    prisma.customerLedgerEntry.create.mockResolvedValue({});
    prisma.invoice.create.mockResolvedValue({ id: 'inv-1' });
    prisma.invoiceItem.create.mockResolvedValue({});
    const r = computeSolar({ curr180: 250, prev180: 100 });
    const out = await persistSolarInvoice({ customerId: 'c-1', result: r, meta: {} });
    expect(prisma.invoice.create).toHaveBeenCalledTimes(1);
    expect(out.items.length).toBe(3); // energy + admin + service
    expect(prisma.invoiceItem.create.mock.calls.length).toBe(3);
  });

  it('14. missing readings default to zero (no crash)', () => {
    expect(() => computeSolar({})).not.toThrow();
  });

  it('15. tier table is bounded and ordered', () => {
    expect(SOLAR_TARIFF_TIERS).toHaveLength(12);
    expect(SOLAR_TARIFF_TIERS[0].limit).toBe(50);
    expect(SOLAR_TARIFF_TIERS[11].limit).toBe(1000);
  });

  it('16. service fee constant is 9.10', () => {
    expect(SOLAR_SERVICE_FEE).toBe(9.10);
  });
});
