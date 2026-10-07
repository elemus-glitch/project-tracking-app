import type { TaskPriority, TaskStatus } from '../types'

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done']

export const STATUS_META: Record<
  TaskStatus,
  { label: string; accent: string; dot: string }
> = {
  todo: {
    label: 'To do',
    accent: 'bg-slate-50 border-slate-200',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'In progress',
    accent: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  done: {
    label: 'Done',
    accent: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
}

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', className: 'bg-sky-100 text-sky-700' },
  high: { label: 'High', className: 'bg-rose-100 text-rose-700' },
}

export const PROJECT_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
]

export function formatDate(value: string | null): string {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isOverdue(task: { due_date: string | null; status: TaskStatus }): boolean {
  if (!task.due_date || task.status === 'done') return false
  const due = new Date(`${task.due_date}T23:59:59`)
  return due.getTime() < Date.now()
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
