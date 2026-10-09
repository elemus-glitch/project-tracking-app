import { useState } from 'react'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/authContext'
import { readAuthError } from './auth/authRedirect'
import { AuthScreen } from './components/auth/AuthScreen'
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen'
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen'
import { SetupGuide } from './components/SetupGuide'
import { Tracker } from './components/Tracker'
import { isSupabaseConfigured } from './lib/supabase'

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupGuide onRetry={() => window.location.reload()} />
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { loading, session, recovery } = useAuth()
  const [showForgot, setShowForgot] = useState(false)
  const [authError] = useState(() => readAuthError())

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      </div>
    )
  }

  if (recovery) return <ResetPasswordScreen />

  if (!session) {
    return showForgot ? (
      <ForgotPasswordScreen onBack={() => setShowForgot(false)} />
    ) : (
      <AuthScreen initialError={authError} onForgotPassword={() => setShowForgot(true)} />
    )
  }

  return <Tracker />
}
