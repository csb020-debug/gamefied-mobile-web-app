-- Quick Fix for School Registration RLS Policy Issue
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. First, check current policies on schools table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'schools';

-- 2. Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create schools" ON public.schools;

-- 3. Create a more permissive INSERT policy for school registration
CREATE POLICY "Allow school creation during registration" 
ON public.schools 
FOR INSERT 
WITH CHECK (true);

-- 4. Optional: Keep the existing SELECT policy
-- This allows anyone to view schools, which is usually fine for school names
CREATE POLICY IF NOT EXISTS "Anyone can view schools" 
ON public.schools 
FOR SELECT 
USING (true);

-- 5. Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'schools';

-- Expected result: You should see:
-- - "Anyone can view schools" FOR SELECT USING (true)
-- - "Allow school creation during registration" FOR INSERT WITH CHECK (true)