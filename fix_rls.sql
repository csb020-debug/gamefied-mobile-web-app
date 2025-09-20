-- Fix circular reference in school_admins RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "School admins can view other admins in their school" ON public.school_admins;
DROP POLICY IF EXISTS "School admins can create admin records for their school" ON public.school_admins;

-- Create a function to check if user is school admin without RLS
CREATE OR REPLACE FUNCTION public.is_user_school_admin(user_id_param UUID)
RETURNS TABLE(school_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT sa.school_id 
  FROM public.school_admins sa 
  WHERE sa.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_school_admin(UUID) TO authenticated;

-- Create new policies that avoid circular reference
CREATE POLICY "School admins can view other admins in their school" 
ON public.school_admins 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  school_id IN (
    SELECT school_id FROM public.is_user_school_admin(auth.uid())
  )
);

CREATE POLICY "School admins can create admin records for their school" 
ON public.school_admins 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR
  school_id IN (
    SELECT school_id FROM public.is_user_school_admin(auth.uid())
  )
);

