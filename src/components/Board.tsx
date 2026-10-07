import { STATUS_META, STATUS_ORDER, classNames } from '../lib/format'
import type { Project, Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

interface BoardProps {
  tasks: Task[]
  projects: Project[]
  onAddTask: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
}

export function Board({
  tasks,
  projects,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: BoardProps) {
  const projectById = new Map(projects.map((project) => [project.id, project]))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status)
        const meta = STATUS_META[status]

        return (
          <section key={status} className={classNames('flex flex-col rounded-xl border p-3', meta.accent)}>
            <header className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={classNames('h-2.5 w-2.5 rounded-full', meta.dot)} />
                <h2 className="text-sm font-semibold text-slate-700">{meta.label}</h2>
                <span className="rounded-full bg-white/70 px-2 text-xs font-medium text-slate-500">
                  {columnTasks.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onAddTask(status)}
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-700"
                aria-label={`Add task to ${meta.label}`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </button>
            </header>

            <div className="scroll-thin flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
              {columnTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
                  Nothing here yet
                </p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    project={projectById.get(task.project_id)}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
