export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Project = {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
}

export type Task = {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  completed_at: string | null
}

type ProjectInsert = Omit<Project, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

type ProjectUpdate = Partial<Project>

type TaskInsert = Omit<Task, 'id' | 'created_at' | 'completed_at'> & {
  id?: string
  created_at?: string
  completed_at?: string | null
}

type TaskUpdate = Partial<Task>

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
        Relationships: []
      }
      tasks: {
        Row: Task
        Insert: TaskInsert
        Update: TaskUpdate
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
