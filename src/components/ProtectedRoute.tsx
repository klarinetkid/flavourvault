import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageSpinner } from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullPageSpinner text="Checking authentication..." />
  }

  if (!user) {
    // Redirect to login page with return url
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  return <>{children}</>
}

// Component for routes that should only be accessible to unauthenticated users
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <FullPageSpinner text="Checking authentication..." />
  }

  if (user) {
    // Redirect authenticated users away from auth pages
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}