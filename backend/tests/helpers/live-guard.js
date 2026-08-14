// P59-B Stage 4D — Live/contract test-suite guard.
// Contract and integration suites hit a RUNNING backend with real POST/DELETE
// operations. To prevent accidental mutation of the operational database, these
// suites REQUIRE an explicit CONTRACT_BASE_URL pointing at a dedicated test
// backend instance (which itself must be running against meter_pulse_test —
// enforced by src/db-guard.js). Without it they SKIP (fail-closed), never
// silently running against the default production backend.

// Set to the test backend ONLY. Absence = skip mutating live suites.
export const CONTRACT_BASE_URL = process.env.CONTRACT_BASE_URL || ''

export const LIVE_TESTS_ENABLED = Boolean(CONTRACT_BASE_URL)
