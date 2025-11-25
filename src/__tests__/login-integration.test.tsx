import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login'
import { AuthProvider } from '@/contexts/AuthContext'
import * as auth from '@/lib/auth'
import type { AuthError } from '@supabase/supabase-js'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  resetPassword: vi.fn(),
  resendVerificationEmail: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: {
      subscription: {
        unsubscribe: vi.fn()
      }
    }
  })),
}))

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('Login Integration Tests', () => {
  const mockSignIn = vi.mocked(auth.signIn)
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  const performLogin = async (email: string, password: string) => {
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.clear(emailInput)
    await user.clear(passwordInput)
    await user.type(emailInput, email)
    await user.type(passwordInput, password)
    await user.click(submitButton)
    
    return { emailInput, passwordInput, submitButton }
  }

  describe('Full Login Flow - Wrong Password', () => {
    it('should display inline error message and retain form values', async () => {
      const wrongPasswordError = {
        message: 'Invalid login credentials',
        status: 400,
        name: 'AuthError',
        code: 'invalid_credentials'
      } as AuthError

      mockSignIn.mockResolvedValueOnce({
        user: null,
        error: wrongPasswordError
      })

      render(<Login />, { wrapper: TestWrapper })

      const { emailInput, passwordInput, submitButton } = await performLogin('test@example.com', 'wrongpassword')

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument()
      })

      // Verify inline error placement (should be under password field)
      const inlineError = screen.getByText('Incorrect email or password.')
      expect(inlineError).toBeInTheDocument()
      
      // Verify form values are retained
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('wrongpassword')
      
      // Verify loading state is cleared
      expect(submitButton).not.toBeDisabled()
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
      
      // Verify no top-level alert
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      
      // Verify navigation didn't happen
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Full Login Flow - Unconfirmed Email', () => {
    it('should display inline error message for unconfirmed email', async () => {
      const unconfirmedEmailError = {
        message: 'Email not confirmed',
        status: 422,
        name: 'AuthError',
        code: 'email_not_confirmed'
      } as AuthError

      mockSignIn.mockResolvedValueOnce({
        user: null,
        error: unconfirmedEmailError
      })

      render(<Login />, { wrapper: TestWrapper })

      const { emailInput, passwordInput, submitButton } = await performLogin('unconfirmed@example.com', 'password123')

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Please confirm your email before logging in.')).toBeInTheDocument()
      })

      // Verify inline error placement
      const inlineError = screen.getByText('Please confirm your email before logging in.')
      expect(inlineError).toBeInTheDocument()
      
      // Verify form values are retained
      expect(emailInput).toHaveValue('unconfirmed@example.com')
      expect(passwordInput).toHaveValue('password123')
      
      // Verify loading state is cleared
      expect(submitButton).not.toBeDisabled()
      
      // Verify no top-level alert
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      
      // Verify navigation didn't happen
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Full Login Flow - Successful Login', () => {
    it('should clear form and navigate on successful login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        email_confirmed_at: '2023-01-01T00:00:00Z'
      }

      mockSignIn.mockResolvedValueOnce({
        user: mockUser,
        error: null
      })

      render(<Login />, { wrapper: TestWrapper })

      const { emailInput, passwordInput } = await performLogin('test@example.com', 'correctpassword')

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })

      // Verify no error messages
      expect(screen.queryByText(/incorrect email or password/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/please confirm your email/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      
      // Form should be cleared after successful login
      await waitFor(() => {
        expect(emailInput).toHaveValue('')
        expect(passwordInput).toHaveValue('')
      })
    })
  })

  describe('Error Recovery Flow', () => {
    it('should clear previous error when attempting login again', async () => {
      const wrongPasswordError = {
        message: 'Invalid login credentials',
        status: 400,
        name: 'AuthError',
        code: 'invalid_credentials'
      } as AuthError

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        email_confirmed_at: '2023-01-01T00:00:00Z'
      }

      render(<Login />, { wrapper: TestWrapper })

      // First attempt - wrong password
      mockSignIn.mockResolvedValueOnce({
        user: null,
        error: wrongPasswordError
      })

      await performLogin('test@example.com', 'wrongpassword')

      await waitFor(() => {
        expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument()
      })

      // Second attempt - correct password
      mockSignIn.mockResolvedValueOnce({
        user: mockUser,
        error: null
      })

      await performLogin('test@example.com', 'correctpassword')

      // Error should be cleared and navigation should happen
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })

      expect(screen.queryByText('Incorrect email or password.')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation Integration', () => {
    it('should show validation errors before attempting API call', async () => {
      render(<Login />, { wrapper: TestWrapper })

      const user = userEvent.setup()
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Try to submit empty form
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })

      // Verify API was not called
      expect(mockSignIn).not.toHaveBeenCalled()
      
      // Verify no navigation happened
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should clear validation errors when valid input is provided', async () => {
      render(<Login />, { wrapper: TestWrapper })

      const user = userEvent.setup()
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // First submit empty form to trigger validation errors
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })

      // Now provide valid input
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'validpassword')

      // Mock successful response
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        email_confirmed_at: '2023-01-01T00:00:00Z'
      }

      mockSignIn.mockResolvedValueOnce({
        user: mockUser,
        error: null
      })

      await user.click(submitButton)

      // Validation errors should be cleared and login should proceed
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })

      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument()
    })
  })
})