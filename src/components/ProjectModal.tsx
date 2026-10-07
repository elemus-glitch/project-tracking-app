import { useState, type FormEvent } from 'react'
import { PROJECT_COLORS, classNames } from '../lib/format'
import type { Project } from '../types'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface ProjectModalProps {
  open: boolean
  project: Project | null
  onClose: () => void
  onSubmit: (values: { name: string; description: string; color: string }) => Promise<string | null>
}

const EMPTY = { name: '', description: '', color: PROJECT_COLORS[0] }

export function ProjectModal({ open, project, onClose, onSubmit }: ProjectModalProps) {
  // The modal is mounted fresh each time it opens (see App), so we can seed the
  // form straight from props instead of syncing with an effect.
  const [values, setValues] = useState(() =>
    project
      ? { name: project.name, description: project.description ?? '', color: project.color }
      : EMPTY,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!values.name.trim()) {
      setError('Please give the project a name.')
      return
    }
    setSaving(true)
    const message = await onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      color: values.color,
    })
    setSaving(false)
    if (message) setError(message)
    else onClose()
  }

  return (
    <Modal open={open} title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            autoFocus
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
            placeholder="Website redesign"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
            rows={3}
            placeholder="What is this project about?"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Colour</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValues({ ...values, color })}
                className={classNames(
                  'h-8 w-8 rounded-full border-2 transition-transform',
                  values.color === color ? 'scale-110 border-slate-800' : 'border-transparent',
                )}
                style={{ backgroundColor: color }}
                aria-label={`Colour ${color}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : project ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
