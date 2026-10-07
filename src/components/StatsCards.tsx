import { isOverdue } from '../lib/format'
import type { Project, Task } from '../types'

interface StatsCardsProps {
  projects: Project[]
  tasks: Task[]
}

export function StatsCards({ projects, tasks }: StatsCardsProps) {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length
  const todo = tasks.filter((task) => task.status === 'todo').length
  const overdue = tasks.filter(isOverdue).length
  const completion = total === 0 ? 0 : Math.round((done / total) * 100)

  const cards = [
    { label: 'Projects', value: projects.length, hint: 'active workspaces', tone: 'text-indigo-600' },
    { label: 'Total tasks', value: total, hint: `${todo} to do`, tone: 'text-slate-900' },
    { label: 'In progress', value: inProgress, hint: 'being worked on', tone: 'text-amber-600' },
    { label: 'Completed', value: done, hint: 'marked done', tone: 'text-emerald-600' },
    { label: 'Overdue', value: overdue, hint: 'past due date', tone: overdue > 0 ? 'text-rose-600' : 'text-slate-900' },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{card.hint}</p>
        </div>
      ))}

      <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-3 lg:col-span-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completion</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{completion}%</p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
    </section>
  )
}
