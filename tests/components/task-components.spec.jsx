import { expect, test } from '@playwright/experimental-ct-react'
import { ProgressRing } from '../../src/components/ProgressRing.jsx'
import { TaskRowHarness } from './TaskRowHarness.jsx'

test('progress ring exposes its progress to assistive technology', async ({ mount }) => {
  const component = await mount(<ProgressRing value={68} />)
  await expect(component).toHaveAttribute('aria-label', '68% виконано')
})

test('task row toggles completion and can be removed', async ({ mount }) => {
  const component = await mount(<TaskRowHarness />)
  await component.getByRole('button', { name: 'Позначити виконаним: Підготувати звіт' }).click()
  await expect(component.getByRole('button', { name: 'Позначити незавершеним: Підготувати звіт' })).toBeVisible()
  await component.getByRole('button', { name: 'Видалити завдання: Підготувати звіт' }).click()
  await expect(component.getByText('Завдання видалено')).toBeVisible()
})