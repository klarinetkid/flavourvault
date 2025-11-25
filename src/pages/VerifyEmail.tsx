import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

const VerifyEmail: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4">
            <Mail className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Check Your Email
          </CardTitle>
          <CardDescription>
            Please confirm your email to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              We've sent a confirmation email to your inbox. Please click the link in the email to verify your account.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check your email inbox (and spam folder)</li>
              <li>Look for an email from FlavourVault</li>
              <li>Click the confirmation link in the email</li>
              <li>Return here to sign in</li>
            </ol>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> You cannot access your account until your email is confirmed.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Didn't receive the email? </span>
            <Link
              to="/forgot-password"
              className="text-primary hover:underline font-medium"
            >
              Resend verification email
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already verified? </span>
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>

          <div className="text-center">
            <Link to="/register">
              <Button variant="outline" className="w-full">
                Back to Registration
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default VerifyEmail