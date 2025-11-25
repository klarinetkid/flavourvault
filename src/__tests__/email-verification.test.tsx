import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import VerifyEmail from '@/pages/VerifyEmail'
import { AuthProvider } from '@/contexts/AuthContext'
import { resendVerificationEmail } from '@/lib/auth'

// Mock the auth library
vi.mock('@/lib/auth', () => ({
  signUp: vi.fn(),
  resendVerificationEmail: vi.fn(),
  resetPassword: vi.fn(),
  getCurrentUser: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  })),
}))

// Mock Supabase
const mockResend = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      resend: mockResend,
      resetPasswordForEmail: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    }
  }
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('Email Verification Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResend.mockClear()
  })

  describe('Register Component', () => {
    it('should redirect to /verify-email after successful sign-up', async () => {
      const { signUp } = await import('@/lib/auth')
      vi.mocked(signUp).mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          created_at: '2023-01-01T00:00:00Z',
          email_confirmed_at: null
        },
        error: null
      })

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      )

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'Password123!' }
      })
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'Password123!' }
      })

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText(/account created!/i)).toBeInTheDocument()
      })

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/verify-email')
      }, { timeout: 3000 })
    })

    it('should show updated success message about email verification', async () => {
      const { signUp } = await import('@/lib/auth')
      vi.mocked(signUp).mockResolvedValue({
        user: {
          id: '123',
          email: 'test@example.com',
          created_at: '2023-01-01T00:00:00Z',
          email_confirmed_at: null
        },
        error: null
      })

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      )

      // Fill out and submit form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'Password123!' }
      })
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'Password123!' }
      })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText(/please check your email to verify your account/i)).toBeInTheDocument()
      })
    })
  })

  describe('VerifyEmail Component', () => {
    it('should render email verification instructions', () => {
      render(
        <TestWrapper>
          <VerifyEmail />
        </TestWrapper>
      )

      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
      expect(screen.getByText(/please confirm your email to continue/i)).toBeInTheDocument()
      expect(screen.getByText(/check your email inbox \(and spam folder\)/i)).toBeInTheDocument()
      expect(screen.getByText(/click the confirmation link in the email/i)).toBeInTheDocument()
    })

    it('should have link to resend verification email', () => {
      render(
        <TestWrapper>
          <VerifyEmail />
        </TestWrapper>
      )

      const resendLink = screen.getByRole('link', { name: /resend verification email/i })
      expect(resendLink).toBeInTheDocument()
      expect(resendLink).toHaveAttribute('href', '/forgot-password')
    })

    it('should have link to sign in page', () => {
      render(
        <TestWrapper>
          <VerifyEmail />
        </TestWrapper>
      )

      const signInLink = screen.getByRole('link', { name: /sign in/i })
      expect(signInLink).toBeInTheDocument()
      expect(signInLink).toHaveAttribute('href', '/login')
    })
  })

  describe('ForgotPassword Component', () => {
    it('should render resend verification email button', () => {
      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument()
    })

    it('should call resendVerificationEmail when resend button is clicked', async () => {
      vi.mocked(resendVerificationEmail).mockResolvedValue({ error: null })

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      )

      // Enter email
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })

      // Click resend button
      fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }))

      await waitFor(() => {
        expect(resendVerificationEmail).toHaveBeenCalledWith('test@example.com')
      })
    })

    it('should show success message when resend verification succeeds', async () => {
      vi.mocked(resendVerificationEmail).mockResolvedValue({ error: null })

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      )

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }))

      await waitFor(() => {
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
      })
    })

    it('should show error message when resend verification fails', async () => {
      vi.mocked(resendVerificationEmail).mockResolvedValue({
        error: { message: 'Rate limit exceeded' } as any
      })

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      )

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }))

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
      })
    })

    it('should show error when trying to resend without email', async () => {
      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      )

      // Click resend without entering email
      fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }))

      await waitFor(() => {
        expect(screen.getByText(/please enter your email address first/i)).toBeInTheDocument()
      })
    })

    it('should disable buttons while loading', async () => {
      vi.mocked(resendVerificationEmail).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      )

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }))

      // Check that buttons are disabled during loading
      expect(screen.getByRole('button', { name: /sending verification/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /send password reset email/i })).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
      })
    })
  })

  // Note: Supabase API integration tests are covered by the component tests above
  // The resendVerificationEmail function is mocked at the module level, so direct
  // integration testing would require a different test setup
})