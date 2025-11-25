import { supabase } from './supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up a new user
export const signUp = async ({ email, password }: SignUpData): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { user: null, error }
    }

    const user = data.user ? {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at
    } : null

    return { user, error: null }
  } catch (error) {
    return { 
      user: null, 
      error: error as AuthError 
    }
  }
}

// Sign in an existing user
export const signIn = async ({ email, password }: SignInData): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error }
    }

    const user = data.user ? {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at
    } : null

    return { user, error: null }
  } catch (error) {
    return { 
      user: null, 
      error: error as AuthError 
    }
  }
}

// Sign out the current user
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// Get the current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      created_at: user.created_at
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get the current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ? {
      id: session.user.id,
      email: session.user.email!,
      created_at: session.user.created_at
    } : null
    
    callback(user)
  })
}

// Reset password
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// Update password
export const updatePassword = async (password: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}