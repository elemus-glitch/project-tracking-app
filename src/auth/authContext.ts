import { createContext, useContext } from 'react'
import type { Session, UserIdentity } from '@supabase/supabase-js'

export interface SignUpResult {
  error: string | null
  /** True when the email is already registered (possibly via Google). */
  emailExists: boolean
  /** True when the account was created but needs email confirmation. */
  needsConfirmation: boolean
}

export interface AuthContextValue {
  session: Session | null
  loading: boolean
  /** True while the user arrived from a password-reset link. */
  recovery: boolean
  identities: UserIdentity[]
  hasPassword: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  linkGoogle: () => Promise<string | null>
  unlinkIdentity: (identity: UserIdentity) => Promise<string | null>
  endRecovery: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
