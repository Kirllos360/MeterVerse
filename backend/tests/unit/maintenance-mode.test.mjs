import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/availability-manager.js', () => ({
  getAvailabilityPlan: () => ({ plan: 'full' }),
  setAvailabilityPlan: vi.fn(),
}));

const { enterMaintenance, exitMaintenance, isMaintenanceActive, getMaintenanceStatus, assertWritesAllowed } = await import('../../src/services/maintenance-mode.js');

describe('P59-C/LR-7 maintenance mode (§12 minimum control layer)', () => {
  beforeEach(() => { exitMaintenance(); vi.clearAllMocks(); });

  it('is inactive by default', () => {
    expect(isMaintenanceActive()).toBe(false);
  });

  it('enters maintenance and reports active', () => {
    enterMaintenance({ reason: 'scheduled' });
    expect(isMaintenanceActive()).toBe(true);
    const s = getMaintenanceStatus();
    expect(s.active).toBe(true);
    expect(s.reason).toBe('scheduled');
  });

  it('exits maintenance', () => {
    enterMaintenance({});
    exitMaintenance();
    expect(isMaintenanceActive()).toBe(false);
  });

  it('auto-exits when scheduledEnd passed', () => {
    enterMaintenance({ scheduledEnd: '2020-01-01T00:00:00Z' }); // in the past
    expect(isMaintenanceActive()).toBe(false);
  });

  it('assertWritesAllowed throws 503 when active', () => {
    enterMaintenance({ reason: 'window' });
    try {
      assertWritesAllowed();
      expect.fail('should have thrown');
    } catch (e) {
      expect(e.status).toBe(503);
      expect(e.code).toBe('MAINTENANCE_MODE');
    }
  });

  it('assertWritesAllowed passes when not active', () => {
    expect(() => assertWritesAllowed()).not.toThrow();
  });
});
