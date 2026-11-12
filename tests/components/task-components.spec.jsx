import { expect, test } from '@playwright/experimental-ct-react'
import { ProgressRing } from '../../src/components/ProgressRing.jsx'
import { TaskRow } from '../../src/components/TaskRow.jsx'

test('progress ring exposes its progress to assistive technology', async ({ mount }) => {
  const component = await mount(<ProgressRing value={68} />)
  await expect(component).toHaveAttribute('aria-label', '68% виконано')
})

test('task row toggles completion and can be removed', async ({ mount }) => {
  let toggledTo
  let deleted = false
  const component = await mount(
    <TaskRow
      task={{ id: 'one', title: 'Підготувати звіт', completed: false }}
      onToggle={(completed) => { toggledTo = completed }}
      onDelete={() => { deleted = true }}
    />,
  )

  await component.getByRole('button', { name: 'Позначити виконаним: Підготувати звіт' }).click()
  expect(toggledTo).toBe(true)
  await component.getByRole('button', { name: 'Видалити завдання: Підготувати звіт' }).click()
  expect(deleted).toBe(true)
})