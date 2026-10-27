import { defineConfig, devices } from '@playwright/experimental-ct-react'

export default defineConfig({
  testDir: './tests/components',
  testMatch: '**/*.spec.jsx',
  use: {
    ...devices['Desktop Chrome'],
    ctPort: 3100,
    trace: 'on-first-retry',
  },
  reporter: 'list',
})