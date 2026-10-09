import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/authContext'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

interface AccountSettingsModalProps {
  open: boolean
  onClose: () => void
}

export function AccountSettingsModal({ open, onClose }: AccountSettingsModalProps) {
  const { session, identities, hasPassword, linkGoogle, unlinkIdentity, updatePassword } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const googleIdentity = identities.find((identity) => identity.provider === 'google')
  const emailIdentity = identities.find((identity) => identity.provider === 'email')

  async function handleConnectGoogle() {
    setError(null)
    setNotice(null)
    setBusy(true)
    const message = await linkGoogle()
    if (message) {
      setError(message)
      setBusy(false)
    }
  }

  async function handleDisconnectGoogle() {
    if (!googleIdentity) return
    setError(null)
    setNotice(null)
    setBusy(true)
    const message = await unlinkIdentity(googleIdentity)
    setBusy(false)
    if (message) setError(message)
    else setNotice('Google disconnected from this account.')
  }

  async function handlePassword(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    const message = await updatePassword(newPassword)
    setBusy(false)
    if (message) setError(message)
    else {
      setNewPassword('')
      setNotice(hasPassword ? 'Password updated.' : 'Password set. You can now sign in with email and password.')
    }
  }

  return (
    <Modal open={open} title="Sign-in methods" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-slate-700">Email</p>
          <p className="text-sm text-slate-500">{session?.user.email}</p>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}

        <div className="space-y-3 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z" />
                <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l3.99-3.09Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.28 6.63l3.99 3.09C6.22 6.87 8.87 4.75 12 4.75Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-slate-700">Google</p>
                <p className="text-xs text-slate-500">
                  {googleIdentity ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {googleIdentity ? (
              <Button
                variant="secondary"
                onClick={handleDisconnectGoogle}
                disabled={busy || identities.length < 2}
                title={identities.length < 2 ? 'Add a password first so you can still sign in.' : undefined}
              >
                Disconnect
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleConnectGoogle} disabled={busy}>
                Connect
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handlePassword} className="space-y-3 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Password</p>
              <p className="text-xs text-slate-500">
                {emailIdentity
                  ? 'Sign in with email and password.'
                  : 'Set a password to sign in with this email too.'}
              </p>
            </div>
          </div>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder={hasPassword ? 'New password' : 'Create a password'}
            className={inputClass}
          />
          <Button type="submit" disabled={busy}>
            {hasPassword ? 'Update password' : 'Set password'}
          </Button>
        </form>

        <p className="text-xs text-slate-400">
          Supabase automatically links a Google and an email account that share the same verified
          email into one user, so you always have a single account. Sign in with whichever method
          you like.
        </p>
      </div>
    </Modal>
  )
}
