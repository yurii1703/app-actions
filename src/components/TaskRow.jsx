import { CheckCircle2, Circle, Trash2 } from 'lucide-react'

export function TaskRow({ task, onToggle, onDelete }) {
  return (
    <article className={`task-row ${task.completed ? 'is-completed' : ''}`}>
      <button className="task-toggle" aria-label={`${task.completed ? 'Позначити незавершеним' : 'Позначити виконаним'}: ${task.title}`} onClick={() => onToggle(!task.completed)}>
        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>
      <span className="task-title">{task.title}</span>
      <button className="icon-button task-delete" aria-label={`Видалити завдання: ${task.title}`} onClick={onDelete}>
        <Trash2 size={16} />
      </button>
    </article>
  )
}