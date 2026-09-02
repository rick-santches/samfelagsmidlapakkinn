import { defineConfig } from 'vitest/config'

// Integration tests that require a live Postgres (DATABASE_URL).
// Run with: npm run test:integration
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    // DB setup/teardown per suite is serial and can exceed the default.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // One connection pool, no cross-suite races on shared rows.
    fileParallelism: false,
  },
})
