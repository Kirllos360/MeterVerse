// P59-B Stage 4D — Production Database Test-Isolation Guard
// Pure, testable logic: determines whether a test-mode database connection is
// targeting the canonical operational database (meter_pulse) and must fail closed.

export const OPERATIONAL_DATABASE = "meter_pulse"

export function databaseNameFromUrl(url) {
  if (!url) return null
  try {
    const m = url.match(/\/\/([^/@]+@)?[^/:]+(?::\d+)?\/([^?]+)/)
    return m ? decodeURIComponent(m[2]) : null
  } catch {
    return null
  }
}

export function isTestMode(env) {
  // Explicit operator intent only. NODE_ENV=test alone is NOT sufficient:
  // vitest sets NODE_ENV=test for ALL tests including mocked unit tests that
  // never connect to a real database. TEST_MODE=1 declares that this process
  // is a dedicated test-DB process and must never target the operational DB.
  return env.TEST_MODE === "1"
}

// Returns an error message if the connection is forbidden, or null if safe.
export function assertSafeTestDatabase(env) {
  if (!isTestMode(env)) return null
  const activeUrl = env.TEST_DATABASE_URL || env.DATABASE_URL || ""
  const activeDb = databaseNameFromUrl(activeUrl)
  if (activeDb && activeDb === OPERATIONAL_DATABASE) {
    return (
      `TEST_MODE=1 with database '${OPERATIONAL_DATABASE}' is FORBIDDEN.\n` +
      `Automated tests must run against a dedicated test database (TEST_DATABASE_URL=meter_pulse_test).\n` +
      `Refusing to start to protect the operational database from test mutation.`
    )
  }
  return null
}
