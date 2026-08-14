import { describe, it, expect } from 'vitest';
import {
  databaseNameFromUrl,
  isTestMode,
  assertSafeTestDatabase,
  OPERATIONAL_DATABASE,
} from '../../src/db-guard.js';

describe('P59-B 4D production database test-isolation guard', () => {
  it('extracts the database name from a postgres URL', () => {
    expect(databaseNameFromUrl('postgresql://user:pw@localhost:5433/meter_pulse')).toBe('meter_pulse');
    expect(databaseNameFromUrl('postgresql://user:pw@localhost:5433/meter_pulse_test?sslmode=require')).toBe('meter_pulse_test');
    expect(databaseNameFromUrl(null)).toBeNull();
    expect(databaseNameFromUrl('not a url')).toBeNull();
  });

  it('detects test mode only from explicit TEST_MODE=1', () => {
    expect(isTestMode({ TEST_MODE: '1' })).toBe(true);
    // NODE_ENV=test alone (vitest default for ALL tests, incl. mocked unit) is NOT test-DB mode.
    expect(isTestMode({ NODE_ENV: 'test' })).toBe(false);
    expect(isTestMode({})).toBe(false);
    expect(isTestMode({ NODE_ENV: 'development' })).toBe(false);
  });

  it('is FORBIDDEN when TEST_MODE=1 resolves to the operational database', () => {
    const err = assertSafeTestDatabase({
      TEST_MODE: '1',
      DATABASE_URL: `postgresql://u:p@h:5433/${OPERATIONAL_DATABASE}`,
    });
    expect(err).toContain('FORBIDDEN');
    expect(err).toContain(OPERATIONAL_DATABASE);
  });

  it('is FORBIDDEN via TEST_DATABASE_URL pointing at operational db', () => {
    const err = assertSafeTestDatabase({
      TEST_MODE: '1',
      TEST_DATABASE_URL: `postgresql://u:p@h:5433/${OPERATIONAL_DATABASE}`,
      DATABASE_URL: 'postgresql://u:p@h:5433/meter_pulse_test',
    });
    expect(err).toContain('FORBIDDEN');
  });

  it('is ALLOWED in test mode against a dedicated test database', () => {
    expect(
      assertSafeTestDatabase({
        TEST_MODE: '1',
        TEST_DATABASE_URL: 'postgresql://u:p@h:5433/meter_pulse_test',
        DATABASE_URL: 'postgresql://u:p@h:5433/meter_pulse_test',
      })
    ).toBeNull();
  });

  it('is ALLOWED in normal mode against the operational database (app boot)', () => {
    expect(
      assertSafeTestDatabase({
        NODE_ENV: 'development',
        DATABASE_URL: `postgresql://u:p@h:5433/${OPERATIONAL_DATABASE}`,
      })
    ).toBeNull();
  });
});
