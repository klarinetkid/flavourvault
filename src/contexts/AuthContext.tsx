import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCurrentUser, onAuthStateChange, signIn, signUp, signOut, resetPassword } from '@/lib/auth'
import type { AuthUser, SignInData, SignUpData, AuthResponse } from '@/lib/auth'
import type { AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (data: SignInData) => Promise<AuthResponse>
  signUp: (data: SignUpData) => Promise<AuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleSignIn = async (data: SignInData): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const result = await signIn(data)
      if (result.user) {
        setUser(result.user)
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpData): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const result = await signUp(data)
      if (result.user) {
        setUser(result.user)
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const result = await signOut()
      if (!result.error) {
        setUser(null)
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (email: string) => {
    return await resetPassword(email)
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}