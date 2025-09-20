# Supabase Connection Troubleshooting Guide

## Quick Fixes for Supabase Connection Issues

### 1. Check Environment Variables
The most common issue is missing or incorrect environment variables.

**Create a `.env.local` file in your project root:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 2. Verify Project URL Format
- Must start with `https://`
- Should end with `.supabase.co`
- Example: `https://myovnlxheufjmmgehczu.supabase.co`

### 3. Verify API Key Format
- Should start with `eyJ`
- Should be the "anon" or "public" key, not the service role key
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Check Database Tables
Make sure your Supabase database has the required tables:
- `user_profiles`
- `students`
- `classes`
- `assignments`
- `submissions`
- `schools`
- `achievement_unlocks`

### 5. Check Row Level Security (RLS)
If RLS is enabled, make sure you have proper policies:
```sql
-- Example policy for user_profiles table
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 6. Restart Development Server
After adding environment variables:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### 7. Check Browser Console
Open browser developer tools and check for:
- Network errors
- CORS issues
- Authentication errors
- Database permission errors

### 8. Test Connection Manually
You can test the connection in browser console:
```javascript
// Check if environment variables are loaded
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test basic connection
import { supabase } from './src/integrations/supabase/client';
supabase.from('user_profiles').select('id').limit(1).then(console.log);
```

### 9. Common Error Messages and Solutions

**"Environment variables not configured"**
- Create `.env.local` file with correct variables
- Restart development server

**"Configuration validation failed"**
- Check URL starts with `https://`
- Check key starts with `eyJ`

**"Connection timeout"**
- Check internet connection
- Verify Supabase project is active
- Check if project URL is correct

**"Failed to connect to Supabase"**
- Check API key permissions
- Verify table exists
- Check RLS policies

**"Permission denied"**
- Check Row Level Security policies
- Verify API key has correct permissions
- Check if user is authenticated (for protected tables)

### 10. Debug Steps
1. Check the Environment Variables Check component on the home page
2. Look at the Supabase Connection Test results
3. Run the Integration Test Suite
4. Check browser console for detailed error messages
5. Verify Supabase dashboard shows project is active

### 11. Still Having Issues?
- Check Supabase project status in dashboard
- Verify billing is up to date
- Check if project has been paused
- Contact Supabase support if project is inaccessible
