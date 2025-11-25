import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ExternalLink, Database, Key, AlertTriangle } from 'lucide-react'

export const SupabaseSetupRequired: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Supabase Setup Required</CardTitle>
          <CardDescription>
            FlavourVault needs to be connected to a Supabase project to work properly.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Missing</AlertTitle>
            <AlertDescription>
              Your environment variables contain placeholder values. Please set up your Supabase project and update your configuration.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5" />
              Quick Setup Steps
            </h3>
            
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                <strong>Create a Supabase project</strong>
                <p className="text-muted-foreground ml-6">
                  Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a> and create a new project
                </p>
              </li>
              
              <li>
                <strong>Get your project credentials</strong>
                <p className="text-muted-foreground ml-6">
                  From your Supabase dashboard, go to Settings → API and copy your Project URL and anon public key
                </p>
              </li>
              
              <li>
                <strong>Update your environment file</strong>
                <p className="text-muted-foreground ml-6">
                  Edit <code className="bg-muted px-1 rounded">.env.local</code> and replace the placeholder values:
                </p>
                <div className="ml-6 mt-2 p-3 bg-muted rounded-md font-mono text-xs">
                  <div>VITE_SUPABASE_URL=https://your-project-id.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
                </div>
              </li>
              
              <li>
                <strong>Set up the database schema</strong>
                <p className="text-muted-foreground ml-6">
                  Run the SQL commands from the setup guide to create the recipes table and security policies
                </p>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Supabase Dashboard
              </a>
            </Button>
            
            <Button variant="outline" asChild className="flex-1">
              <a 
                href="/SUPABASE_SETUP.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Database className="h-4 w-4" />
                View Setup Guide
              </a>
            </Button>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong> After updating your environment variables, you'll need to restart the development server for the changes to take effect.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}