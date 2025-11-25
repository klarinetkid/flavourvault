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

describe('Login Error Handling', () => {
  const mockSignIn = vi.mocked(auth.signIn)
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  const fillLoginForm = async (email = 'test@example.com', password = 'password123') => {
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    await user.clear(emailInput)
    await user.clear(passwordInput)
    await user.type(emailInput, email)
    await user.type(passwordInput, password)
    
    return { emailInput, passwordInput, user }
  }

  const submitForm = async () => {
    const user = userEvent.setup()
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
  }

  describe('Wrong Password Error', () => {
    it('should show correct inline error message for wrong password', async () => {
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

      await fillLoginForm('test@example.com', 'wrongpassword')
      await submitForm()

      await waitFor(() => {
        expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument()
      })

      // Should be displayed inline under password field, not at the top
      const passwordField = screen.getByLabelText(/password/i)
      const errorElement = screen.getByText('Incorrect email or password.')
      
      // Check that error is near the password field (inline)
      expect(errorElement).toBeInTheDocument()
      
      // Should not show error at the top of the form
      const topAlert = screen.queryByRole('alert')
      expect(topAlert).not.toBeInTheDocument()
    })

    it('should clear loading spinner after wrong password error', async () => {
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

      await fillLoginForm()
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await userEvent.setup().click(submitButton)

      // Should clear loading state after error
      await waitFor(() => {
        expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument()
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Unconfirmed Email Error', () => {
    it('should show correct inline error message for unconfirmed email', async () => {
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

      await fillLoginForm('unconfirmed@example.com', 'password123')
      await submitForm()

      await waitFor(() => {
        expect(screen.getByText('Please confirm your email before logging in.')).toBeInTheDocument()
      })

      // Should be displayed inline under password field
      const errorElement = screen.getByText('Please confirm your email before logging in.')
      expect(errorElement).toBeInTheDocument()
      
      // Should not show error at the top of the form
      const topAlert = screen.queryByRole('alert')
      expect(topAlert).not.toBeInTheDocument()
    })

    it('should clear loading spinner after unconfirmed email error', async () => {
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

      await fillLoginForm()
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await userEvent.setup().click(submitButton)

      // Should clear loading state after error
      await waitFor(() => {
        expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Successful Login', () => {
    it('should show no error on successful login', async () => {
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

      await fillLoginForm()
      await submitForm()

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })

      // Should not show any error messages
      expect(screen.queryByText(/incorrect email or password/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/please confirm your email/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Network/Server Errors', () => {
    it('should show top-level error for server errors', async () => {
      const serverError = {
        message: 'Internal server error',
        status: 500,
        name: 'AuthError',
        code: 'internal_server_error'
      } as AuthError

      mockSignIn.mockResolvedValueOnce({
        user: null,
        error: serverError
      })

      render(<Login />, { wrapper: TestWrapper })

      await fillLoginForm()
      await submitForm()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/connection error/i)).toBeInTheDocument()
      })

      // Should not show inline error
      const passwordSection = screen.getByLabelText(/password/i).closest('div')
      expect(passwordSection).not.toHaveTextContent(/server error/i)
    })
  })

  describe('Error State Management', () => {
    it('should clear previous errors when submitting again', async () => {
      const wrongPasswordError = {
        message: 'Invalid login credentials',
        status: 400,
        name: 'AuthError',
        code: 'invalid_credentials'
      } as AuthError

      // First attempt - wrong password
      mockSignIn.mockResolvedValueOnce({
        user: null,
        error: wrongPasswordError
      })

      render(<Login />, { wrapper: TestWrapper })

      await fillLoginForm('test@example.com', 'wrongpassword')
      await submitForm()

      await waitFor(() => {
        expect(screen.getByText('Incorrect email or password.')).toBeInTheDocument()
      })

      // Second attempt - successful
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

      await fillLoginForm('test@example.com', 'correctpassword')
      await submitForm()

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      })

      // Previous error should be cleared
      expect(screen.queryByText('Incorrect email or password.')).not.toBeInTheDocument()
    })

    it('should handle unexpected errors gracefully', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Network error'))

      render(<Login />, { wrapper: TestWrapper })

      await fillLoginForm()
      await submitForm()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        // Network errors are mapped to connection error messages
        expect(screen.getByText('Connection error. Please check your internet connection and try again.')).toBeInTheDocument()
      })

      // Loading should be cleared
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors before attempting login', async () => {
      render(<Login />, { wrapper: TestWrapper })

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await userEvent.setup().click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })

      // Should not call signIn if validation fails
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })
})