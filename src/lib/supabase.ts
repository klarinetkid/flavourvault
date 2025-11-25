import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

const isPlaceholder = (value: string) => {
  return !value ||
         value === 'your_supabase_project_url' ||
         value === 'your_supabase_anon_key' ||
         value.includes('your-project-id') ||
         value.includes('your-anon-key')
}

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env.local file and ensure you have:')
  console.error('- VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.error('- VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.error('\nSee SUPABASE_SETUP.md for detailed setup instructions.')
  throw new Error('Missing Supabase environment variables. Please configure your .env.local file.')
}

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.error('❌ Supabase environment variables contain placeholder values!')
  console.error('Current values:')
  console.error(`- VITE_SUPABASE_URL: ${supabaseUrl}`)
  console.error(`- VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey?.substring(0, 20)}...`)
  console.error('\nPlease replace these with your actual Supabase project credentials.')
  console.error('See SUPABASE_SETUP.md for detailed setup instructions.')
  throw new Error('Supabase environment variables contain placeholder values. Please configure your actual Supabase project credentials.')
}

if (!isValidUrl(supabaseUrl)) {
  console.error('❌ Invalid Supabase URL format!')
  console.error(`Current URL: ${supabaseUrl}`)
  console.error('Expected format: https://your-project-id.supabase.co')
  throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL')
}

console.log('✅ Supabase configuration loaded successfully')
console.log(`📡 Connecting to: ${supabaseUrl}`)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})