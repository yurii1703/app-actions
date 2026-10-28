import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

export default async function globalSetup() {
  const testDatabase = resolve(process.cwd(), 'test-results', 'playwright-users.json')
  await mkdir(resolve(process.cwd(), 'test-results'), { recursive: true })
  await copyFile(resolve(process.cwd(), 'tests', 'e2e', 'fixtures', 'playwright-users.json'), testDatabase)
}