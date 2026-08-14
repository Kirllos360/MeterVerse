import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/middleware/security.js', () => ({ auditLog: vi.fn() }));

const { validateRow, IMPORT_SCHEMAS, executeImport, createImportJob, MAX_IMPORT_ROWS } = await import('../../src/services/import-engine.js');

describe('P59-C/LR-3 import engine (Solar Excel ImportJob, MeterVerse-native)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('schema registry covers the three legacy solar import types', () => {
    expect(Object.keys(IMPORT_SCHEMAS)).toEqual(['solar_customers', 'solar_invoices', 'solar_payments']);
  });

  it('validates a good invoice row', () => {
    const r = validateRow('solar_invoices', { 'Meter Serial': 'M-001', 'Month': '2026-03', 'Invoice Amount': 120.5 }, 2);
    expect(r.ok).toBe(true);
  });

  it('rejects a row missing required column', () => {
    const r = validateRow('solar_invoices', { 'Meter Serial': '', 'Month': '2026-03', 'Invoice Amount': 120.5 }, 2);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("Meter Serial");
  });

  it('rejects non-numeric amount', () => {
    const r = validateRow('solar_invoices', { 'Meter Serial': 'M-001', 'Month': '2026-03', 'Invoice Amount': 'abc' }, 2);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain("Invoice Amount");
  });

  it('validates solar_customers required Arabic Name + meter serial', () => {
    const ok = validateRow('solar_customers', { 'Arabic Name': 'عميل', 'Meter Serial Electricity': 'E-9' }, 2);
    expect(ok.ok).toBe(true);
    const bad = validateRow('solar_customers', { 'Arabic Name': '', 'Meter Serial Electricity': 'E-9' }, 2);
    expect(bad.ok).toBe(false);
  });

  it('executeImport processes valid rows and records failures', async () => {
    prisma.customer.create.mockResolvedValue({ id: 'c-1' });
    prisma.meter.create.mockResolvedValue({ id: 'm-1' });
    prisma.meter.update.mockResolvedValue({ id: 'm-1', customerId: 'c-1' });
    const rows = [
      { index: 2, data: { 'Arabic Name': 'A', 'Meter Serial Electricity': 'E-1' } },
      { index: 3, data: { 'Arabic Name': '', 'Meter Serial Electricity': 'E-2' } }, // invalid
    ];
    const r = await executeImport('solar_customers', rows, {});
    expect(r.processed).toBe(1);
    expect(r.failed).toBe(1);
    expect(prisma.customer.create).toHaveBeenCalledTimes(1);
  });

  it('executeImport invoice requires an existing meter', async () => {
    prisma.meter.findFirst.mockResolvedValue(null);
    const rows = [{ index: 2, data: { 'Meter Serial': 'GHOST', 'Month': '2026-03', 'Invoice Amount': 10 } }];
    const r = await executeImport('solar_invoices', rows, {});
    expect(r.failed).toBe(1);
    expect(r.results[0].errors[0]).toContain("meter not found");
  });

  it('createImportJob persists preview with row payload (idempotent execution)', async () => {
    prisma.importJob.create.mockResolvedValue({ id: 'job-1', status: 'preview' });
    const job = await createImportJob({ type: 'solar_invoices', fileName: 'x.xlsx', rows: [{ index: 2, data: {} }], errors: [], req: {} });
    expect(prisma.importJob.create).toHaveBeenCalled();
    const payload = JSON.parse(prisma.importJob.create.mock.calls[0][0].data.errors);
    expect(payload.rows).toHaveLength(1);
    expect(job.id).toBe('job-1');
  });

  it('exposes a bounded MAX_IMPORT_ROWS guard', () => {
    expect(MAX_IMPORT_ROWS).toBe(50000);
  });
});
