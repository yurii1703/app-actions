import { expect, test } from '@playwright/test'

test('creates a personal task list, tracks progress, and persists the result', async ({ page }) => {
  const name = `Олена Playwright ${Date.now()}`
  const title = 'Підготувати презентацію'

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Твій ритм роботи' })).toBeVisible()
  await page.getByRole('link', { name: 'Новий користувач' }).click()
  await page.getByLabel('Ім’я користувача').fill(name)
  await page.getByRole('button', { name: 'Створити користувача' }).click()
  await expect(page.getByRole('heading', { name: `Завдання ${name}` })).toBeVisible()

  await page.getByLabel('Нове завдання').fill(title)
  await page.getByRole('button', { name: 'Додати завдання' }).click()
  await expect(page.getByText(title)).toBeVisible()
  await page.getByRole('button', { name: `Позначити виконаним: ${title}` }).click()
  await expect(page.getByRole('button', { name: `Позначити незавершеним: ${title}` })).toBeVisible()
  await expect(page.getByRole('img', { name: '100% виконано' })).toBeVisible()

  await page.getByRole('link', { name: 'Ритм, на головну' }).click()
  await expect(page.getByRole('heading', { name: 'Топ прогресу' })).toBeVisible()
  await expect(page.locator('.leader-row').filter({ hasText: name })).toBeVisible()

  const response = await page.request.get('/api/users')
  expect(response.ok()).toBeTruthy()
  const users = await response.json()
  const user = users.find((item) => item.name === name)
  expect(user.tasks).toHaveLength(1)
  expect(user.tasks[0]).toMatchObject({ title, completed: true })
})

test('keeps the dashboard usable on a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Твій ритм роботи' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Головна навігація' }).getByRole('link', { name: 'Користувачі' })).toBeVisible()
  const documentWidth = await page.locator('body').evaluate((body) => body.scrollWidth)
  expect(documentWidth).toBeLessThanOrEqual(375)
})