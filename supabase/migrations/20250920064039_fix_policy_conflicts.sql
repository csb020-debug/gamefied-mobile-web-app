-- Fix policy conflicts by dropping existing policies and recreating them
-- This migration handles the case where policies already exist

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;
DROP POLICY IF EXISTS "Authenticated users can create schools" ON public.schools;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "School admins can view their own records" ON public.school_admins;
DROP POLICY IF EXISTS "School admins can create their own records" ON public.school_admins;
DROP POLICY IF EXISTS "Teachers can view their own record" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can create their own record" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON public.classes;
DROP POLICY IF EXISTS "Anyone can view students" ON public.students;
DROP POLICY IF EXISTS "Anyone can create students" ON public.students;
DROP POLICY IF EXISTS "Anyone can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can view achievement unlocks" ON public.achievement_unlocks;
DROP POLICY IF EXISTS "Anyone can create achievement unlocks" ON public.achievement_unlocks;

-- Recreate policies with proper names
-- Schools policies
CREATE POLICY "Anyone can view schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create schools" ON public.schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- School admins policies
CREATE POLICY "School admins can view their own records" ON public.school_admins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "School admins can create their own records" ON public.school_admins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teachers policies
CREATE POLICY "Teachers can view their own record" ON public.teachers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can create their own record" ON public.teachers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Classes policies
CREATE POLICY "Teachers can view their own classes" ON public.classes FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create their own classes" ON public.classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own classes" ON public.classes FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own classes" ON public.classes FOR DELETE USING (auth.uid() = teacher_id);

-- Students policies
CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Anyone can create students" ON public.students FOR INSERT WITH CHECK (true);

-- Assignments policies
CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Teachers can manage assignments" ON public.assignments FOR ALL USING (
  class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
);

-- Submissions policies
CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can create submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update submissions" ON public.submissions FOR UPDATE USING (true);

-- Achievement unlocks policies
CREATE POLICY "Anyone can view achievement unlocks" ON public.achievement_unlocks FOR SELECT USING (true);
CREATE POLICY "Anyone can create achievement unlocks" ON public.achievement_unlocks FOR INSERT WITH CHECK (true);
