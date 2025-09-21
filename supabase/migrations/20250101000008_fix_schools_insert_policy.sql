-- Fix schools table INSERT policy to allow authenticated users to create schools
-- This enables the school registration flow where authenticated users can create schools

-- Add INSERT policy for schools table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'Allow authenticated users to create schools'
  ) THEN
    CREATE POLICY "Allow authenticated users to create schools"
    ON public.schools
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Add UPDATE policy for school admins to update their schools
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'School admins can update their schools'
  ) THEN
    CREATE POLICY "School admins can update their schools"
    ON public.schools
    FOR UPDATE
    USING (
      id IN (
        SELECT sa.school_id FROM public.school_admins sa 
        WHERE sa.user_id = auth.uid()
      )
    );
  END IF;
END $$;