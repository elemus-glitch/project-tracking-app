import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/authContext'
import { Button } from '../ui/Button'

interface ForgotPasswordScreenProps {
  onBack: () => void
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setBusy(true)
    const message = await sendPasswordReset(email.trim())
    setBusy(false)
    if (message) setError(message)
    else setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Reset your password</h1>

        {sent ? (
          <div className="mt-3 space-y-4">
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way.
              Open it to choose a new password.
            </p>
            <Button variant="secondary" className="w-full" onClick={onBack}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we'll send you a link to set a new password. This also works for
              accounts created with Google.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>

              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

              <Button type="submit" disabled={busy} className="w-full">
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
              <button
                type="button"
                onClick={onBack}
                className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Back to sign in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
