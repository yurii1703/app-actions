import { useState } from 'react'
import { TaskRow } from '../../src/components/TaskRow.jsx'

export function TaskRowHarness() {
  const [task, setTask] = useState({ id: 'one', title: 'Підготувати звіт', completed: false })
  const [visible, setVisible] = useState(true)
  if (!visible) return <p>Завдання видалено</p>
  return <TaskRow task={task} onToggle={(completed) => setTask({ ...task, completed })} onDelete={() => setVisible(false)} />
}