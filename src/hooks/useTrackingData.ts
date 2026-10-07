import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Project, Task, TaskStatus } from '../types'

export type RealtimeStatus = 'off' | 'connecting' | 'connected' | 'disconnected'

export interface NewProject {
  name: string
  description?: string
  color: string
}

export interface NewTask {
  project_id: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: Task['priority']
  due_date?: string | null
}

interface TrackingData {
  projects: Project[]
  tasks: Task[]
  loading: boolean
  error: string | null
  realtimeStatus: RealtimeStatus
  refresh: () => Promise<void>
  dismissError: () => void
  createProject: (input: NewProject) => Promise<string | null>
  updateProject: (id: string, input: Partial<NewProject>) => Promise<string | null>
  deleteProject: (id: string) => Promise<string | null>
  createTask: (input: NewTask) => Promise<string | null>
  updateTask: (id: string, input: Partial<Task>) => Promise<string | null>
  deleteTask: (id: string) => Promise<string | null>
  setTaskStatus: (id: string, status: TaskStatus) => Promise<string | null>
}

export function useTrackingData(): TrackingData {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>(
    isSupabaseConfigured ? 'connecting' : 'off',
  )
  const clientRef = useRef(supabase)

  const refresh = useCallback(async () => {
    const client = clientRef.current
    if (!client) {
      setLoading(false)
      return
    }

    const [projectsRes, tasksRes] = await Promise.all([
      client.from('projects').select('*').order('created_at', { ascending: true }),
      client.from('tasks').select('*').order('created_at', { ascending: false }),
    ])

    if (projectsRes.error || tasksRes.error) {
      setError(projectsRes.error?.message ?? tasksRes.error?.message ?? 'Unknown error')
    } else {
      setProjects(projectsRes.data ?? [])
      setTasks(tasksRes.data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Realtime: keeps every teammate's board in sync without a manual refresh.
  useEffect(() => {
    const client = clientRef.current
    if (!client) {
      setRealtimeStatus('off')
      return
    }

    const channel = client
      .channel('tracking-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => void refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => void refresh(),
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('disconnected')
        } else {
          setRealtimeStatus('connecting')
        }
      })

    return () => {
      void client.removeChannel(channel)
    }
  }, [refresh])

  const runMutation = useCallback(
    async (action: () => Promise<{ error: { message: string } | null }>) => {
      const { error: mutationError } = await action()
      if (mutationError) {
        setError(mutationError.message)
        return mutationError.message
      }
      await refresh()
      return null
    },
    [refresh],
  )

  const createProject = useCallback(
    (input: NewProject) =>
      runMutation(async () => {
        const client = clientRef.current
        if (!client) return { error: { message: 'Supabase is not configured.' } }
        return client.from('projects').insert({
          name: input.name,
          description: input.description ?? null,
          color: input.color,
        })
      }),
    [runMutation],
  )

  const updateProject = useCallback(
    (id: string, input: Partial<NewProject>) =>
      runMutation(async () => {
        const client = clientRef.current
        if (!client) return { error: { message: 'Supabase is not configured.' } }
        return client.from('projects').update(input).eq('id', id)
      }),
    [runMutation],
  )

  const deleteProject = useCallback(
    (id: string) =>
      runMutation(async () => {
        const client = clientRef.current
        if (!client) return { error: { message: 'Supabase is not configured.' } }
        return client.from('projects').delete().eq('id', id)
      }),
    [runMutation],
  )

  const createTask = useCallback(
    (input: NewTask) =>
      runMutation(async () => {
        const client = clientRef.current
        if (!client) return { error: { message: 'Supabase is not configured.' } }
        return client.from('tasks').insert({
          project_id: input.project_id,
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? 'todo',
          priority: input.priority ?? 'medium',
          due_date: input.due_date ?? null,
        })
      }),
    [runMutation],
  )

  const updateTask = useCallback(
    (id: string, input: Partial<Task>) =>
      runMutation(async () => {
        const client = clientRef.current
        if (!client) return { error: { message: 'Supabase is not configured.' } }
        return client.from('tasks').update(input).eq('id', id)
      }),
    [runMutation],
  )

  const deleteTask = useCallback(
    (id: string) =>
      runMutation(async () => {
        const client = clientRef.current
        if (!client) return { error: { message: 'Supabase is not configured.' } }
        return client.from('tasks').delete().eq('id', id)
      }),
    [runMutation],
  )

  const setTaskStatus = useCallback(
    (id: string, status: TaskStatus) => updateTask(id, { status }),
    [updateTask],
  )

  return {
    projects,
    tasks,
    loading,
    error,
    realtimeStatus,
    refresh,
    dismissError: () => setError(null),
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    setTaskStatus,
  }
}
