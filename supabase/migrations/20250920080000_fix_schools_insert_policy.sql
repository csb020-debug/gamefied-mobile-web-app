-- Fix schools INSERT policy to allow unauthenticated users during registration
-- This allows school creation before Google OAuth authentication

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can create schools" ON public.schools;

-- Create a more permissive policy that allows anyone to create schools
-- This is needed for the registration flow where school info is collected before auth
CREATE POLICY "Anyone can create schools" ON public.schools 
FOR INSERT WITH CHECK (true);

-- Optional: Add an UPDATE policy for authenticated users to modify their schools
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Authenticated users can update schools') THEN
        CREATE POLICY "Authenticated users can update schools" ON public.schools 
        FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;