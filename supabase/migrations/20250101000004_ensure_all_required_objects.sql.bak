-- Ensure all required database objects exist and are properly configured
-- This migration consolidates and ensures all required tables, RPCs, and triggers exist

-- Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Ensure all required tables exist with proper structure
-- Classes table (ensure school_id column exists)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;

-- Ensure all required RPCs exist and are properly configured
-- create_user_profile RPC
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id_param UUID,
  email_param TEXT,
  full_name_param TEXT DEFAULT NULL,
  role_param TEXT DEFAULT 'teacher',
  school_id_param UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  profile_id UUID;
  result JSON;
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (user_id, email, full_name, role, school_id)
  VALUES (user_id_param, email_param, full_name_param, role_param, school_id_param)
  RETURNING id INTO profile_id;
  
  -- If role is school_admin, also create school_admin record
  IF role_param = 'school_admin' AND school_id_param IS NOT NULL THEN
    INSERT INTO public.school_admins (user_id, school_id)
    VALUES (user_id_param, school_id_param)
    ON CONFLICT (user_id, school_id) DO NOTHING;
  END IF;
  
  -- If role is teacher, also create teacher record
  IF role_param = 'teacher' THEN
    INSERT INTO public.teachers (user_id, school_id, full_name, email)
    VALUES (user_id_param, school_id_param, full_name_param, email_param)
    ON CONFLICT (user_id) DO UPDATE SET
      school_id = EXCLUDED.school_id,
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      updated_at = now();
  END IF;
  
  RETURN json_build_object('success', true, 'profile_id', profile_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- accept_teacher_invitation RPC
CREATE OR REPLACE FUNCTION public.accept_teacher_invitation(invitation_token_param TEXT)
RETURNS JSON AS $$
DECLARE
  invitation_record RECORD;
  result JSON;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record 
  FROM public.teacher_invitations 
  WHERE invitation_token = invitation_token_param 
    AND status = 'pending' 
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Update the invitation status
  UPDATE public.teacher_invitations 
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;
  
  -- Return success with school info
  SELECT json_build_object(
    'success', true,
    'school_id', invitation_record.school_id,
    'school_name', s.name
  ) INTO result
  FROM public.schools s 
  WHERE s.id = invitation_record.school_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- send_teacher_invitation RPC
CREATE OR REPLACE FUNCTION public.send_teacher_invitation(
  school_id_param UUID,
  teacher_email_param TEXT,
  invited_by_param UUID
)
RETURNS JSON AS $$
DECLARE
  invitation_id UUID;
  invitation_token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Check if invitation already exists and is pending
  IF EXISTS (
    SELECT 1 FROM public.teacher_invitations 
    WHERE school_id = school_id_param 
      AND teacher_email = teacher_email_param 
      AND status = 'pending'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Invitation already sent to this email');
  END IF;
  
  -- Create invitation
  INSERT INTO public.teacher_invitations (school_id, invited_by, teacher_email)
  VALUES (school_id_param, invited_by_param, teacher_email_param)
  RETURNING id, invitation_token, expires_at INTO invitation_id, invitation_token, expires_at;
  
  RETURN json_build_object(
    'success', true,
    'invitation_id', invitation_id,
    'invitation_token', invitation_token,
    'expires_at', expires_at
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- get_school_teachers RPC
CREATE OR REPLACE FUNCTION public.get_school_teachers(school_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.email,
    t.full_name,
    t.is_active,
    t.created_at
  FROM public.teachers t
  WHERE t.school_id = school_id_param
  ORDER BY t.created_at ASC;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- get_school_admins RPC
CREATE OR REPLACE FUNCTION public.get_school_admins(school_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.user_id,
    up.email,
    up.full_name,
    sa.created_at
  FROM public.school_admins sa
  JOIN public.user_profiles up ON sa.user_id = up.user_id
  WHERE sa.school_id = school_id_param
  ORDER BY sa.created_at ASC;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- update_teacher_status RPC
CREATE OR REPLACE FUNCTION public.update_teacher_status(
  teacher_id_param UUID,
  is_active_param BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE public.teachers 
  SET is_active = is_active_param, updated_at = now()
  WHERE id = teacher_id_param;
  
  IF FOUND THEN
    RETURN json_build_object('success', true, 'message', 'Teacher status updated');
  ELSE
    RETURN json_build_object('success', false, 'error', 'Teacher not found');
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Ensure class code generation trigger exists
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := UPPER(substring(encode(gen_random_bytes(3), 'base64') from 1 for 6));
    -- Remove any non-alphanumeric characters
    code := regexp_replace(code, '[^A-Z0-9]', '', 'g');
    -- Ensure it's exactly 6 characters
    IF length(code) >= 6 THEN
      code := substring(code from 1 for 6);
      -- Check if code already exists
      IF NOT EXISTS (SELECT 1 FROM public.classes WHERE class_code = code) THEN
        RETURN code;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Ensure class code trigger exists
CREATE OR REPLACE FUNCTION public.set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_code IS NULL OR NEW.class_code = '' THEN
    NEW.class_code := public.generate_class_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop and recreate trigger to ensure it's properly configured
DROP TRIGGER IF EXISTS set_class_code_trigger ON public.classes;
CREATE TRIGGER set_class_code_trigger
  BEFORE INSERT ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_class_code();

-- Ensure RLS policies are properly configured for all tables
-- Update classes policies to work with new role system
DROP POLICY IF EXISTS "Users can view classes they have access to" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "School admins can update classes in their school" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON public.classes;
DROP POLICY IF EXISTS "School admins can delete classes in their school" ON public.classes;

-- Recreate classes policies
CREATE POLICY "Users can view classes they have access to" 
ON public.classes 
FOR SELECT 
USING (
  teacher_id = auth.uid() OR
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can create classes" 
ON public.classes 
FOR INSERT 
WITH CHECK (
  teacher_id = auth.uid() AND
  (school_id IS NULL OR school_id IN (
    SELECT up.school_id FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'teacher'
  ))
);

CREATE POLICY "Teachers can update their own classes" 
ON public.classes 
FOR UPDATE 
USING (teacher_id = auth.uid());

CREATE POLICY "School admins can update classes in their school" 
ON public.classes 
FOR UPDATE 
USING (
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete their own classes" 
ON public.classes 
FOR DELETE 
USING (teacher_id = auth.uid());

CREATE POLICY "School admins can delete classes in their school" 
ON public.classes 
FOR DELETE 
USING (
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

-- Ensure students can view assignments in their class
DROP POLICY IF EXISTS "Students can view assignments in their class" ON public.assignments;
CREATE POLICY "Students can view assignments in their class" 
ON public.assignments 
FOR SELECT 
USING (
  class_id IN (
    SELECT s.class_id FROM public.students s 
    WHERE s.id IN (
      SELECT id FROM public.students 
      WHERE class_id = assignments.class_id
    )
  )
);

-- Ensure students can manage their own submissions
DROP POLICY IF EXISTS "Students can create and update their own submissions" ON public.submissions;
CREATE POLICY "Students can create and update their own submissions" 
ON public.submissions 
FOR ALL 
USING (
  student_id IN (
    SELECT s.id FROM public.students s 
    WHERE s.id = submissions.student_id
  )
);

-- Grant necessary permissions for RPCs
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_teacher_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_teacher_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_teachers TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_admins TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_teacher_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_class_code TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_class_code TO authenticated;
