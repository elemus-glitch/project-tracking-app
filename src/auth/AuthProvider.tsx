import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { clearAuthParams, getRedirectUrl } from './authRedirect'
import { AuthContext, type AuthContextValue, type SignUpResult } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [recovery, setRecovery] = useState(false)
  // Set after the user chooses a password this session; combined with the
  // identities list below to decide whether to say "Set" or "Change" password.
  const [passwordJustSet, setPasswordJustSet] = useState(false)

  useEffect(() => {
    const client = supabase
    if (!client) return

    let active = true
    void client.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true)
        clearAuthParams()
      }
      setSession(nextSession)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const identities = useMemo(() => session?.user?.identities ?? [], [session])
  const hasPassword =
    passwordJustSet || identities.some((identity) => identity.provider === 'email')

  const signIn = useCallback(async (email: string, password: string) => {
    const client = supabase
    if (!client) return 'Supabase is not configured.'
    const { error } = await client.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    const client = supabase
    if (!client)
      return { error: 'Supabase is not configured.', emailExists: false, needsConfirmation: false }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: getRedirectUrl() },
    })

    if (error) return { error: error.message, emailExists: false, needsConfirmation: false }

    // Supabase returns a user with no identities (and sends no email) when the
    // address is already registered, to avoid leaking which emails exist.
    const emailExists = Boolean(data.user && (data.user.identities?.length ?? 0) === 0)
    const needsConfirmation = !emailExists && !data.session
    return { error: null, emailExists, needsConfirmation }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const client = supabase
    if (!client) return 'Supabase is not configured.'
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() },
    })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    const client = supabase
    if (!client) return 'Supabase is not configured.'
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl(),
    })
    return error?.message ?? null
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const client = supabase
    if (!client) return 'Supabase is not configured.'
    const { error } = await client.auth.updateUser({ password })
    if (!error) {
      setPasswordJustSet(true)
      // Pull a fresh session/user so the identities list reflects the change.
      await client.auth.refreshSession()
    }
    return error?.message ?? null
  }, [])

  const linkGoogle = useCallback(async () => {
    const client = supabase
    if (!client) return 'Supabase is not configured.'
    const { error } = await client.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() },
    })
    return error?.message ?? null
  }, [])

  const unlinkIdentity = useCallback(async (identity: Parameters<AuthContextValue['unlinkIdentity']>[0]) => {
    const client = supabase
    if (!client) return 'Supabase is not configured.'
    const { error } = await client.auth.unlinkIdentity(identity)
    if (!error) await client.auth.refreshSession()
    return error?.message ?? null
  }, [])

  const endRecovery = useCallback(() => {
    setRecovery(false)
    clearAuthParams()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      recovery,
      identities,
      hasPassword,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
      updatePassword,
      linkGoogle,
      unlinkIdentity,
      endRecovery,
    }),
    [
      session,
      loading,
      recovery,
      identities,
      hasPassword,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
      updatePassword,
      linkGoogle,
      unlinkIdentity,
      endRecovery,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
