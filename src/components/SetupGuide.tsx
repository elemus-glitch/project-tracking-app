import type { ReactNode } from 'react'

interface SetupGuideProps {
  onRetry: () => void
}

const STEPS: Array<{ title: string; body: ReactNode }> = [
  {
    title: 'Create the tables',
    body: (
      <>
        In your Supabase dashboard open <strong>SQL Editor</strong>, paste the contents of{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">supabase/schema.sql</code> and click{' '}
        <strong>Run</strong>.
      </>
    ),
  },
  {
    title: 'Copy your API credentials',
    body: (
      <>
        Go to <strong>Project Settings → API</strong> and copy the <strong>Project URL</strong> and the{' '}
        <strong>anon public</strong> key.
      </>
    ),
  },
  {
    title: 'Create a local env file',
    body: (
      <>
        Duplicate <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.example</code> as{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.local</code> and fill in both values:
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
          {`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </>
    ),
  },
  {
    title: 'Restart the dev server',
    body: (
      <>
        Vite only reads env files on startup. Stop the server (<kbd>Ctrl</kbd>+<kbd>C</kbd>) and run{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">npm run dev</code> again, then reload this page.
      </>
    ),
  },
]

export function SetupGuide({ onRetry }: SetupGuideProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-amber-900">Connect your Supabase project</h2>
        <p className="mt-1 text-sm text-amber-800">
          The app has no Supabase credentials yet, so it can't read or write data. Follow these
          steps to bring it online.
        </p>
      </div>

      <ol className="mt-6 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {index + 1}
            </span>
            <div>
              <h3 className="font-medium text-slate-800">{step.title}</h3>
              <div className="mt-1 text-sm text-slate-600">{step.body}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          I've configured it — reload
        </button>
      </div>
    </div>
  )
}
