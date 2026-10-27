import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { delimiter, dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'

const configs = {
  components: 'playwright-ct.config.js',
  e2e: 'playwright.config.js',
}
const config = configs[process.argv[2]]
const runnerArguments = process.argv.slice(3)

if (!config) {
  console.error('Use "components" or "e2e" as the test suite.')
  process.exit(1)
}

const require = createRequire(import.meta.url)
const playwrightDirectory = dirname(require.resolve('playwright/package.json'))
const localLibraries = join(homedir(), '.cache', 'ritm', 'playwright-libs')
const env = { ...process.env }

if (existsSync(localLibraries)) {
  env.LD_LIBRARY_PATH = [localLibraries, env.LD_LIBRARY_PATH].filter(Boolean).join(delimiter)
}

const runner = spawn(process.execPath, [join(playwrightDirectory, 'cli.js'), 'test', '-c', config, ...runnerArguments], {
  stdio: 'inherit',
  env,
})

runner.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})
runner.on('exit', (code) => {
  process.exitCode = code ?? 1
})