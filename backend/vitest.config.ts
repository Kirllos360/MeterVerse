import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/helpers/setup.js'],
    include: ['tests/unit/**/*.test.mjs', 'tests/api/**/*.test.mjs'],
    exclude: ['node_modules', 'tests/integration.test.mjs', 'tests/notification-engine.test.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
