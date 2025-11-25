# FlavourVault Supabase Setup Guide

This guide will walk you through setting up Supabase for the FlavourVault application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- The FlavourVault project cloned locally

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com and sign in to your account
2. Click "New Project"
3. Choose your organization
4. Fill in the project details:
   - **Name**: FlavourVault
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your application URLs:
   - For development: `http://localhost:8080`
   - For production: Your production domain
3. Under **Auth Providers**, ensure **Email** is enabled
4. Configure email templates if desired (optional)

## Step 3: Set Up the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query and run the following SQL:

```sql
-- Create the recipes table
CREATE TABLE public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    servings INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_index INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own recipes" ON public.recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own recipes" ON public.recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own recipes" ON public.recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own recipes" ON public.recipes
    FOR DELETE USING (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_order_index ON public.recipes(order_index);
```

## Step 4: Get Your Project Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **anon public** key (the public API key)

## Step 5: Configure Environment Variables

1. In your FlavourVault project, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 6: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:8080`
3. Try registering a new account
4. Create a test recipe
5. Verify the data appears in your Supabase dashboard under **Table Editor** > **recipes**

## Troubleshooting

### Common Issues

**Authentication not working:**
- Check that your Site URL is correctly configured
- Verify your environment variables are correct
- Make sure you're using the correct anon key (not the service role key)

**Database queries failing:**
- Verify the RLS policies are correctly set up
- Check that the user is authenticated before making queries
- Look at the browser console for detailed error messages

**Migration not working:**
- Ensure you have existing localStorage data
- Check the browser console for migration errors
- Verify the user is authenticated before migration runs

### Useful Supabase Dashboard Sections

- **Authentication** > **Users**: View registered users
- **Table Editor**: View and edit your data
- **SQL Editor**: Run custom queries
- **Logs**: View real-time logs for debugging

## Production Deployment

When deploying to production:

1. Update your Supabase Site URL to include your production domain
2. Set up proper environment variables in your hosting platform
3. Consider setting up database backups
4. Monitor your usage in the Supabase dashboard

## Security Notes

- Never commit your `.env.local` file to version control
- The anon key is safe to use in client-side code
- Row Level Security (RLS) ensures users can only access their own data
- Always validate data on both client and server side

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the browser console for error messages
3. Check the Supabase dashboard logs
4. Consult the FlavourVault project documentation