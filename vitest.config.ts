import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'prisma/**/*.test.ts'],
    // Integration tests need a live Postgres — run them via
    // `npm run test:integration`, keep the default suite hermetic.
    exclude: ['**/node_modules/**', '**/*.integration.test.ts'],
  },
})
