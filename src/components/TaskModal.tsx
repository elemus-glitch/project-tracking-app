import { useState, type FormEvent } from 'react'
import { STATUS_META, STATUS_ORDER, classNames } from '../lib/format'
import type { Project, Task, TaskPriority, TaskStatus } from '../types'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

export interface TaskFormValues {
  project_id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
}

interface TaskModalProps {
  open: boolean
  task: Task | null
  projects: Project[]
  defaultProjectId?: string
  defaultStatus?: TaskStatus
  onClose: () => void
  onSubmit: (values: TaskFormValues) => Promise<string | null>
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export function TaskModal({
  open,
  task,
  projects,
  defaultProjectId,
  defaultStatus = 'todo',
  onClose,
  onSubmit,
}: TaskModalProps) {
  // Mounted fresh each time it opens (see App), so the initial values can be
  // derived from props without an effect.
  const [values, setValues] = useState<TaskFormValues>(() =>
    task
      ? {
          project_id: task.project_id,
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
        }
      : {
          project_id: defaultProjectId ?? projects[0]?.id ?? '',
          title: '',
          description: '',
          status: defaultStatus,
          priority: 'medium',
          due_date: null,
        },
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!values.title.trim()) {
      setError('Please give the task a title.')
      return
    }
    if (!values.project_id) {
      setError('Create a project first, then add tasks to it.')
      return
    }
    setSaving(true)
    const message = await onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    })
    setSaving(false)
    if (message) setError(message)
    else onClose()
  }

  return (
    <Modal open={open} title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <input
            autoFocus
            value={values.title}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
            placeholder="Implement login screen"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Project</label>
            <select
              value={values.project_id}
              onChange={(event) => setValues({ ...values, project_id: event.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {projects.length === 0 && <option value="">No projects yet</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
            <input
              type="date"
              value={values.due_date ?? ''}
              onChange={(event) =>
                setValues({ ...values, due_date: event.target.value || null })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <div className="flex gap-1.5">
              {STATUS_ORDER.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setValues({ ...values, status })}
                  className={classNames(
                    'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                    values.status === status
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {STATUS_META[status].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setValues({ ...values, priority })}
                  className={classNames(
                    'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors',
                    values.priority === priority
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
