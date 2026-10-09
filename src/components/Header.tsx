import type { RealtimeStatus } from '../hooks/useTrackingData'
import { classNames } from '../lib/format'
import { UserMenu } from './auth/UserMenu'
import { Button } from './ui/Button'

const REALTIME_META: Record<RealtimeStatus, { label: string; dot: string }> = {
  connected: { label: 'Live', dot: 'bg-emerald-500' },
  connecting: { label: 'Connecting', dot: 'bg-amber-500 animate-pulse' },
  disconnected: { label: 'Offline', dot: 'bg-rose-500' },
  off: { label: 'Not configured', dot: 'bg-slate-400' },
}

interface HeaderProps {
  realtimeStatus: RealtimeStatus
  refreshing: boolean
  onRefresh: () => void
  onNewProject: () => void
}

export function Header({ realtimeStatus, refreshing, onRefresh, onNewProject }: HeaderProps) {
  const realtime = REALTIME_META[realtimeStatus]

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Project Tracker</h1>
            <p className="text-xs text-slate-500">Team progress, powered by Supabase</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <span className={classNames('h-2 w-2 rounded-full', realtime.dot)} />
            {realtime.label}
          </span>
          <Button variant="secondary" onClick={onRefresh} disabled={refreshing}>
            <svg viewBox="0 0 20 20" fill="currentColor" className={classNames('h-4 w-4', refreshing && 'animate-spin')}>
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
            </svg>
            Refresh
          </Button>
          <Button onClick={onNewProject}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            New project
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
