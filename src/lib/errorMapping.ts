import type { AuthError } from '@supabase/supabase-js'

/**
 * Maps Supabase authentication error codes to user-friendly messages
 */
export const mapAuthError = (error: AuthError): string => {
  // Handle specific error messages first
  if (error.message) {
    const message = error.message.toLowerCase()
    
    // Email not confirmed (check this first)
    if (message.includes('email not confirmed') ||
        message.includes('confirm your email')) {
      return 'Please confirm your email before logging in.'
    }
    
    // Wrong password or invalid credentials
    if (message.includes('invalid login credentials') ||
        message.includes('invalid email or password')) {
      return 'Incorrect email or password.'
    }
    
    // Too many requests
    if (message.includes('too many requests') || 
        message.includes('rate limit')) {
      return 'Too many login attempts. Please try again later.'
    }
    
    // Network or server errors
    if (message.includes('network') || 
        message.includes('fetch') ||
        message.includes('server')) {
      return 'Connection error. Please check your internet connection and try again.'
    }
  }
  
  // Handle specific error codes if available
  switch (error.status) {
    case 400:
      return 'Incorrect email or password.'
    case 422:
      return 'Please confirm your email before logging in.'
    case 429:
      return 'Too many login attempts. Please try again later.'
    case 500:
    case 502:
    case 503:
      return 'Server error. Please try again later.'
    default:
      // Fallback to original message if it's user-friendly, otherwise generic message
      if (error.message && error.message.length < 100 && !error.message.includes('fetch')) {
        return error.message
      }
      return 'An error occurred during login. Please try again.'
  }
}

/**
 * Determines if an error should be displayed inline under the password field
 * vs at the top of the form
 */
export const shouldDisplayInlineError = (error: AuthError): boolean => {
  if (!error.message) return true
  
  const message = error.message.toLowerCase()
  
  // These errors are related to credentials and should be shown inline
  return message.includes('invalid login credentials') ||
         message.includes('invalid email or password') ||
         message.includes('email not confirmed') ||
         message.includes('confirm your email')
}