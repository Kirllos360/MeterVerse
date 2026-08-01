import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    setupFiles: ['tests/helpers/setup.js'],
    include: ['tests/unit/**/*.test.mjs', 'tests/api/**/*.test.mjs'],
    exclude: ['node_modules', 'tests/integration.test.mjs', 'tests/contract/**/*.test.mjs', 'tests/notification-engine.test.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 46,
        functions: 48,
        branches: 36,
        statements: 43,
      },
    },
  },
});
