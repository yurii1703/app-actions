import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

export default async function globalSetup() {
  await rm(resolve(process.cwd(), 'data', 'playwright-users.json'), { force: true })
}