import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/services/logger.js', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { ingestReading } = await import('../../src/services/symbiot-bridge.js');

describe('P60.6 SEP/Symbiot bridge — ingestReading (external meter -> MeterVerse reading)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('happy path: persists a reading for a known meter serial (tenancy propagated)', async () => {
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-1', serial: 'SEP-001', areaId: 'area-a', projectId: null });
    prisma.reading.create.mockResolvedValue({ id: 'r-1', meterId: 'm-1', value: 123.4 });
    const res = await ingestReading({ meter: 'SEP-001', value: 123.4 });
    expect(res.ok).toBe(true);
    expect(res.meterId).toBe('m-1');
    const data = prisma.reading.create.mock.calls[0][0].data;
    expect(data.source).toBe('symbiot');
    expect(data.areaId).toBe('area-a'); // tenancy propagated from meter
    expect(data.value).toBe(123.4);
  });

  it('rejects a payload with no meter identity (fail-closed)', async () => {
    const res = await ingestReading({ value: 10 });
    expect(res.ok).toBe(false);
    expect(res.code).toBe('MISSING_METER');
    expect(prisma.reading.create).not.toHaveBeenCalled();
  });

  it('rejects a payload with missing/invalid value', async () => {
    const res = await ingestReading({ meter: 'SEP-001' });
    expect(res.ok).toBe(false);
    expect(res.code).toBe('INVALID_VALUE');
  });

  it('rejects an unknown meter serial (no silent drop, no fabrication)', async () => {
    prisma.meter.findUnique.mockResolvedValue(null);
    const res = await ingestReading({ serial: 'GHOST', value: 5 });
    expect(res.ok).toBe(false);
    expect(res.code).toBe('UNKNOWN_METER');
    expect(prisma.reading.create).not.toHaveBeenCalled();
  });

  it('accepts alternative identity fields (meter_id) and custom unit/source', async () => {
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-2', serial: 'SEP-002', areaId: null, projectId: 'p-1' });
    prisma.reading.create.mockResolvedValue({ id: 'r-2', meterId: 'm-2' });
    const res = await ingestReading({ meter_id: 'SEP-002', value: '55.5', unit: 'kWh', source: 'SEP' });
    expect(res.ok).toBe(true);
    const data = prisma.reading.create.mock.calls[0][0].data;
    expect(data.source).toBe('SEP');
    expect(data.projectId).toBe('p-1');
    expect(data.value).toBe(55.5);
  });

  it('parses timestamp when provided, else defaults to now', async () => {
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-3', serial: 'SEP-003', areaId: null, projectId: null });
    prisma.reading.create.mockResolvedValue({ id: 'r-3', meterId: 'm-3' });
    await ingestReading({ meter: 'SEP-003', value: 1, timestamp: '2026-01-15T10:00:00Z' });
    const data = prisma.reading.create.mock.calls[0][0].data;
    expect(new Date(data.timestamp).toISOString()).toBe('2026-01-15T10:00:00.000Z');
  });

  it('P58 horizontal-privilege safe: payload cannot override tenancy (areaId/projectId come from the meter)', async () => {
    // Meter in area-a; malicious payload tries to inject area-b / project-x
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-4', serial: 'SEP-004', areaId: 'area-a', projectId: null });
    prisma.reading.create.mockResolvedValue({ id: 'r-4', meterId: 'm-4' });
    const res = await ingestReading({ meter: 'SEP-004', value: 3, areaId: 'area-b', projectId: 'project-x' });
    expect(res.ok).toBe(true);
    const data = prisma.reading.create.mock.calls[0][0].data;
    expect(data.areaId).toBe('area-a'); // server-side meter tenancy wins
    expect(data.projectId).toBeNull();
    expect(data.areaId).not.toBe('area-b');
  });

  it('idempotency semantics: repeated push appends a new Reading (append, no partial state; dedup is downstream)', async () => {
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-5', serial: 'SEP-005', areaId: null, projectId: null });
    prisma.reading.create.mockResolvedValue({ id: 'r-5', meterId: 'm-5' });
    const payload = { meter: 'SEP-005', value: 10, timestamp: '2026-01-15T10:00:00Z' };
    await ingestReading(payload);
    await ingestReading(payload); // retry / duplicate push
    expect(prisma.reading.create).toHaveBeenCalledTimes(2); // append semantics, both persisted
  });
});
