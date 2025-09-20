# Database Setup Guide

## Current Issue
The error `Could not find the table 'public.user_profiles' in the schema cache (Code: PGRST205)` indicates that the database tables haven't been created yet in your Supabase project.

## Solution

### Step 1: Create Tables in Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/myovnlxheufjmmgehczu
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy and paste the entire contents** of `create_tables_manually.sql` into the SQL Editor
4. **Click "Run"** to execute the SQL

This will create all required tables:
- `schools`
- `user_profiles` 
- `school_admins`
- `teachers`
- `classes`
- `students`
- `assignments`
- `submissions`
- `achievement_unlocks`

### Step 2: Verify Tables Created

After running the SQL, you should see:
- ✅ All tables created successfully
- ✅ RLS policies applied
- ✅ Functions and triggers created

### Step 3: Test Your Application

1. **Refresh your browser** at `http://localhost:8080`
2. **Check the Integration Test Suite** - it should now show:
   - ✅ **Environment Configuration**: Environment properly configured
   - ✅ **Supabase Connection**: Successfully connected to Supabase
   - ✅ **All other tests**: Should work properly

## Alternative: Using Supabase CLI

If you prefer using the CLI, you can try:

```bash
# Set your database password
$env:SUPABASE_DB_PASSWORD="your-database-password"

# Apply migrations
npx supabase db push
```

## Troubleshooting

### If you get "relation does not exist" errors:
- Make sure you ran the SQL in the correct order
- Check that all tables were created successfully
- Verify RLS policies are applied

### If you get RLS errors:
- The simplified RLS policies should avoid circular references
- Check the Supabase logs for specific error details

### If connection still fails:
- Verify your `.env.local` file has the correct API keys
- Check that your Supabase project is active
- Ensure your API keys have the correct permissions

## Next Steps

Once the tables are created:
1. Test user registration and login
2. Test creating schools, classes, and students
3. Test the full application workflow
4. Verify all features work as expected

The application should now work completely with Supabase! 🎉

