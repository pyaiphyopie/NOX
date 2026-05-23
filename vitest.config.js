import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    extensions: ['jsx'],
    globals: true,

    // ── Coverage ──────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',           // entry point — tested via integration
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 65,
        lines: 70,
      },
    },

    // ── Output ────────────────────────────────────
    reporters: process.env.CI
      ? ['default', 'junit']
      : ['default'],
    outputFile: process.env.CI
      ? { junit: './test-results/junit.xml' }
      : undefined,
  },
});
