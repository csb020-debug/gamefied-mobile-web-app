-- Step 2: Create additional tables
-- Run this after Step 1 completes successfully

-- Create school_admins table
CREATE TABLE IF NOT EXISTS public.school_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_id)
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
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

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  class_code TEXT NOT NULL UNIQUE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "School admins can view their own records" ON public.school_admins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "School admins can create their own records" ON public.school_admins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view their own record" ON public.teachers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can create their own record" ON public.teachers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view their own classes" ON public.classes FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create their own classes" ON public.classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own classes" ON public.classes FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own classes" ON public.classes FOR DELETE USING (auth.uid() = teacher_id);
