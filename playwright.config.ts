import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: [
    'tests/**/*.test.ts',
    'tests/**/*.test.js',
    'src/**/*.test.ts',
    'src/**/*.test.js',
  ],
  testIgnore: [
    '**/node_modules/**',
    '**/.kilo/**',
    '**/.git/**',
    '**/dist/**',
    '**/pack/**',
    '**/.vite-inspect/**',
  ],
  // Prevent concurrent Electron launches in tests if multiple tests are run
  workers: process.env.CI ? 1 : undefined,
});
