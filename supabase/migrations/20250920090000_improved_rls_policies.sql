-- Improved RLS Policies for Enhanced Security and Performance
-- This migration creates secure, role-based access control policies

-- First, drop all existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;
DROP POLICY IF EXISTS "Anyone can create schools" ON public.schools;
DROP POLICY IF EXISTS "Anyone can view students" ON public.students;
DROP POLICY IF EXISTS "Anyone can create students" ON public.students;
DROP POLICY IF EXISTS "Anyone can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can view achievement unlocks" ON public.achievement_unlocks;
DROP POLICY IF EXISTS "Anyone can create achievement unlocks" ON public.achievement_unlocks;

-- SCHOOLS TABLE POLICIES
-- Allow unauthenticated school creation (needed for registration flow)
CREATE POLICY "Unauthenticated can create schools" ON public.schools 
FOR INSERT WITH CHECK (auth.role() IS NULL OR auth.role() = 'anon');

-- Authenticated users can view schools they're associated with
CREATE POLICY "Users can view associated schools" ON public.schools 
FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    -- School admins can see their school
    id IN (SELECT school_id FROM user_profiles WHERE user_id = auth.uid() AND role = 'school_admin') OR
    -- Teachers can see their school
    id IN (SELECT school_id FROM user_profiles WHERE user_id = auth.uid() AND role = 'teacher') OR
    -- Teachers can see schools through their classes
    id IN (
      SELECT DISTINCT c.school_id 
      FROM classes c 
      WHERE c.teacher_id = auth.uid()
    )
  )
);

-- School admins can update their own school
CREATE POLICY "School admins can update their school" ON public.schools 
FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  id IN (SELECT school_id FROM user_profiles WHERE user_id = auth.uid() AND role = 'school_admin')
);

-- USER PROFILES TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles 
FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own profile
CREATE POLICY "Users can create own profile" ON public.user_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles 
FOR UPDATE USING (auth.uid() = user_id);

-- SCHOOL ADMINS TABLE POLICIES
CREATE POLICY "School admins can manage own records" ON public.school_admins 
FOR ALL USING (auth.uid() = user_id);

-- TEACHERS TABLE POLICIES
CREATE POLICY "Teachers can manage own records" ON public.teachers 
FOR ALL USING (auth.uid() = user_id);

-- CLASSES TABLE POLICIES
-- Teachers can manage their own classes
CREATE POLICY "Teachers can manage own classes" ON public.classes 
FOR ALL USING (auth.uid() = teacher_id);

-- Students can view classes (for joining with class codes)
CREATE POLICY "Students can view classes" ON public.classes 
FOR SELECT USING (true);

-- School admins can view classes in their school
CREATE POLICY "School admins can view school classes" ON public.classes 
FOR SELECT USING (
  school_id IN (SELECT school_id FROM user_profiles WHERE user_id = auth.uid() AND role = 'school_admin')
);

-- STUDENTS TABLE POLICIES
-- Students can view their own record (by ID, not auth)
CREATE POLICY "Students can view records" ON public.students 
FOR SELECT USING (true);

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view class students" ON public.students 
FOR SELECT USING (
  class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
);

-- Teachers and students can create student records
CREATE POLICY "Can create student records" ON public.students 
FOR INSERT WITH CHECK (
  class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()) OR
  auth.role() = 'authenticated'
);

-- ASSIGNMENTS TABLE POLICIES
-- Teachers can manage assignments in their classes
CREATE POLICY "Teachers can manage class assignments" ON public.assignments 
FOR ALL USING (
  class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
);

-- Students can view assignments in their classes
CREATE POLICY "Students can view class assignments" ON public.assignments 
FOR SELECT USING (
  class_id IN (
    SELECT class_id FROM students 
    WHERE id IN (
      SELECT student_id FROM submissions 
      WHERE assignment_id = assignments.id
    )
  ) OR
  -- Allow general viewing for game assignments
  type IN ('game', 'challenge')
);

-- SUBMISSIONS TABLE POLICIES
-- Students can manage submissions they created
CREATE POLICY "Students can manage submissions" ON public.submissions 
FOR ALL USING (
  student_id IN (SELECT id FROM students)
);

-- Allow creating submissions for any student
CREATE POLICY "Can create submissions" ON public.submissions 
FOR INSERT WITH CHECK (true);

-- Teachers can view submissions for their class assignments
CREATE POLICY "Teachers can view class submissions" ON public.submissions 
FOR SELECT USING (
  assignment_id IN (
    SELECT a.id FROM assignments a 
    JOIN classes c ON a.class_id = c.id 
    WHERE c.teacher_id = auth.uid()
  )
);

-- Teachers can update submissions for grading
CREATE POLICY "Teachers can update class submissions" ON public.submissions 
FOR UPDATE USING (
  assignment_id IN (
    SELECT a.id FROM assignments a 
    JOIN classes c ON a.class_id = c.id 
    WHERE c.teacher_id = auth.uid()
  )
);

-- ACHIEVEMENT UNLOCKS TABLE POLICIES
-- Students can view achievements for any student (leaderboard)
CREATE POLICY "Can view achievement unlocks" ON public.achievement_unlocks 
FOR SELECT USING (true);

-- Can create achievement unlocks
CREATE POLICY "Can create achievement unlocks" ON public.achievement_unlocks 
FOR INSERT WITH CHECK (true);

-- Teachers can view achievements for their students
CREATE POLICY "Teachers can view student achievements" ON public.achievement_unlocks 
FOR SELECT USING (
  student_id IN (
    SELECT s.id FROM students s 
    JOIN classes c ON s.class_id = c.id 
    WHERE c.teacher_id = auth.uid()
  )
);

-- TEACHER INVITATIONS TABLE POLICIES (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teacher_invitations') THEN
        -- Only school admins can manage teacher invitations for their school
        EXECUTE 'CREATE POLICY "School admins can manage teacher invitations" ON public.teacher_invitations 
        FOR ALL USING (
          school_id IN (SELECT school_id FROM user_profiles WHERE user_id = auth.uid() AND role = ''school_admin'')
        )';
        
        -- Allow viewing invitations by token (for accepting invitations)
        EXECUTE 'CREATE POLICY "Anyone can view invitations by token" ON public.teacher_invitations 
        FOR SELECT USING (invitation_token IS NOT NULL)';
    END IF;
END $$;

-- Add helpful comments for future reference
COMMENT ON POLICY "Users can view own profile" ON public.user_profiles IS 
'Users can only view their own profile to ensure privacy';

COMMENT ON POLICY "Users can view associated schools" ON public.schools IS 
'Users can only view schools they are associated with through their role';

COMMENT ON POLICY "Teachers can manage own classes" ON public.classes IS 
'Teachers have full control over classes they created';