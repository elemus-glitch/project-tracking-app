import { useMemo, useState } from 'react'
import type { NewProject } from '../hooks/useTrackingData'
import { useTrackingData } from '../hooks/useTrackingData'
import { classNames } from '../lib/format'
import type { Project, Task, TaskStatus } from '../types'
import { Board } from './Board'
import { Header } from './Header'
import { ProjectModal } from './ProjectModal'
import { ProjectPanel } from './ProjectPanel'
import { StatsCards } from './StatsCards'
import { TaskModal, type TaskFormValues } from './TaskModal'

interface ProjectModalState {
  open: boolean
  project: Project | null
}

interface TaskModalState {
  open: boolean
  task: Task | null
  defaultProjectId?: string
  defaultStatus: TaskStatus
}

export function Tracker() {
  const data = useTrackingData()

  const [projectModal, setProjectModal] = useState<ProjectModalState>({ open: false, project: null })
  const [taskModal, setTaskModal] = useState<TaskModalState>({
    open: false,
    task: null,
    defaultStatus: 'todo',
  })
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase()
    return data.tasks.filter((task) => {
      const matchesProject = projectFilter === 'all' || task.project_id === projectFilter
      const matchesSearch =
        term.length === 0 ||
        task.title.toLowerCase().includes(term) ||
        (task.description ?? '').toLowerCase().includes(term)
      return matchesProject && matchesSearch
    })
  }, [data.tasks, projectFilter, search])

  async function handleRefresh() {
    setRefreshing(true)
    await data.refresh()
    setRefreshing(false)
  }

  function handleProjectSubmit(values: NewProject) {
    if (projectModal.project) return data.updateProject(projectModal.project.id, values)
    return data.createProject(values)
  }

  async function handleProjectDelete(project: Project) {
    if (!window.confirm(`Delete "${project.name}" and all of its tasks?`)) return
    await data.deleteProject(project.id)
    if (projectFilter === project.id) setProjectFilter('all')
  }

  function handleTaskSubmit(values: TaskFormValues) {
    if (taskModal.task) {
      return data.updateTask(taskModal.task.id, {
        ...values,
        completed_at: values.status === 'done' ? new Date().toISOString() : null,
      })
    }
    return data.createTask(values)
  }

  async function handleTaskDelete(task: Task) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    await data.deleteTask(task.id)
  }

  function handleTaskStatusChange(task: Task, status: TaskStatus) {
    void data.updateTask(task.id, {
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    })
  }

  return (
    <div className="min-h-full">
      <Header
        realtimeStatus={data.realtimeStatus}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onNewProject={() => setProjectModal({ open: true, project: null })}
      />

      {data.error && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <div>
              <p className="font-medium">Supabase error</p>
              <p className="mt-0.5">{data.error}</p>
              <p className="mt-1 text-xs text-rose-600">
                If the tables are missing, run <code>supabase/schema.sql</code> in the Supabase SQL
                Editor.
              </p>
            </div>
            <button
              type="button"
              onClick={data.dismissError}
              className="shrink-0 rounded-md p-1 text-rose-500 hover:bg-rose-100"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <StatsCards projects={data.projects} tasks={data.tasks} />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setProjectFilter('all')}
                className={classNames(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  projectFilter === 'all'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                )}
              >
                All projects
              </button>
              {data.projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setProjectFilter(project.id)}
                  className={classNames(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    projectFilter === project.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                  {project.name}
                </button>
              ))}

              <div className="ml-auto w-full sm:w-56">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {data.loading ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Loading your board…
              </div>
            ) : (
              <Board
                tasks={filteredTasks}
                projects={data.projects}
                onAddTask={(status) =>
                  setTaskModal({
                    open: true,
                    task: null,
                    defaultStatus: status,
                    defaultProjectId: projectFilter !== 'all' ? projectFilter : undefined,
                  })
                }
                onEditTask={(task) => setTaskModal({ open: true, task, defaultStatus: task.status })}
                onDeleteTask={handleTaskDelete}
                onStatusChange={handleTaskStatusChange}
              />
            )}
          </div>

          <ProjectPanel
            projects={data.projects}
            tasks={data.tasks}
            onAdd={() => setProjectModal({ open: true, project: null })}
            onEdit={(project) => setProjectModal({ open: true, project })}
            onDelete={handleProjectDelete}
          />
        </div>
      </main>

      {projectModal.open && (
        <ProjectModal
          open
          project={projectModal.project}
          onClose={() => setProjectModal({ open: false, project: null })}
          onSubmit={handleProjectSubmit}
        />
      )}

      {taskModal.open && (
        <TaskModal
          open
          task={taskModal.task}
          projects={data.projects}
          defaultProjectId={taskModal.defaultProjectId}
          defaultStatus={taskModal.defaultStatus}
          onClose={() => setTaskModal({ open: false, task: null, defaultStatus: 'todo' })}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  )
}
