-- Create user_profiles table to store user roles and additional information
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('school_admin', 'teacher', 'student')) DEFAULT 'teacher',
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create school_admins table to track school administrators
CREATE TABLE public.school_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_id)
);

-- Create teachers table to track teacher information
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "School admins can view profiles in their school" 
ON public.user_profiles 
FOR SELECT 
USING (
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

-- RLS Policies for school_admins
CREATE POLICY "School admins can view their own admin records" 
ON public.school_admins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "School admins can view other admins in their school" 
ON public.school_admins 
FOR SELECT 
USING (
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

CREATE POLICY "School admins can create admin records for their school" 
ON public.school_admins 
FOR INSERT 
WITH CHECK (
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

-- RLS Policies for teachers
CREATE POLICY "Teachers can view their own record" 
ON public.teachers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "School admins can view teachers in their school" 
ON public.teachers 
FOR SELECT 
USING (
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

CREATE POLICY "School admins can manage teachers in their school" 
ON public.teachers 
FOR ALL 
USING (
  school_id IN (
    SELECT sa.school_id FROM public.school_admins sa 
    WHERE sa.user_id = auth.uid()
  )
);

-- Create function to create user profile
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
    VALUES (user_id_param, school_id_param);
  END IF;
  
  -- If role is teacher, also create teacher record
  IF role_param = 'teacher' THEN
    INSERT INTO public.teachers (user_id, school_id, full_name, email)
    VALUES (user_id_param, school_id_param, full_name_param, email_param);
  END IF;
  
  RETURN json_build_object('success', true, 'profile_id', profile_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE user_id = user_id_param;
  
  RETURN COALESCE(user_role, 'teacher');
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user is school admin
CREATE OR REPLACE FUNCTION public.is_school_admin(user_id_param UUID, school_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.school_admins 
    WHERE user_id = user_id_param AND school_id = school_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get school admins
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
$$ LANGUAGE plpgsql;

-- Create function to get school teachers
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
$$ LANGUAGE plpgsql;

-- Create function to update teacher status
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
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_admins_updated_at
  BEFORE UPDATE ON public.school_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing RLS policies to use new role system
-- Update classes policies to check for school admin permissions
DROP POLICY IF EXISTS "Teachers can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON public.classes;

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
