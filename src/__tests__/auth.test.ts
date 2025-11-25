import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp, signIn, signOut, getCurrentUser } from '@/lib/auth'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    }
  }
}))

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      }

      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.user).toEqual({
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      })
      expect(result.error).toBeNull()
    })

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already exists' }

      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      }

      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.user).toEqual({
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      })
      expect(result.error).toBeNull()
    })

    it('should handle sign in errors', async () => {
      const mockError = { message: 'Invalid credentials' }

      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      })

      const result = await signOut()

      expect(result.error).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out failed' }

      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError
      })

      const result = await signOut()

      expect(result.error).toEqual(mockError)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      }

      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await getCurrentUser()

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z'
      })
    })

    it('should return null when no user', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })
})