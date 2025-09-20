-- Add missing policies using IF NOT EXISTS to avoid conflicts
-- This migration safely adds policies that might already exist

-- Schools policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Anyone can view schools') THEN
        CREATE POLICY "Anyone can view schools" ON public.schools FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Authenticated users can create schools') THEN
        CREATE POLICY "Authenticated users can create schools" ON public.schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- User profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can create their own profile') THEN
        CREATE POLICY "Users can create their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- School admins policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_admins' AND policyname = 'School admins can view their own records') THEN
        CREATE POLICY "School admins can view their own records" ON public.school_admins FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_admins' AND policyname = 'School admins can create their own records') THEN
        CREATE POLICY "School admins can create their own records" ON public.school_admins FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Teachers policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Teachers can view their own record') THEN
        CREATE POLICY "Teachers can view their own record" ON public.teachers FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'Teachers can create their own record') THEN
        CREATE POLICY "Teachers can create their own record" ON public.teachers FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Classes policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Teachers can view their own classes') THEN
        CREATE POLICY "Teachers can view their own classes" ON public.classes FOR SELECT USING (auth.uid() = teacher_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Teachers can create their own classes') THEN
        CREATE POLICY "Teachers can create their own classes" ON public.classes FOR INSERT WITH CHECK (auth.uid() = teacher_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Teachers can update their own classes') THEN
        CREATE POLICY "Teachers can update their own classes" ON public.classes FOR UPDATE USING (auth.uid() = teacher_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Teachers can delete their own classes') THEN
        CREATE POLICY "Teachers can delete their own classes" ON public.classes FOR DELETE USING (auth.uid() = teacher_id);
    END IF;
END $$;

-- Students policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Anyone can view students') THEN
        CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Anyone can create students') THEN
        CREATE POLICY "Anyone can create students" ON public.students FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Assignments policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assignments' AND policyname = 'Anyone can view assignments') THEN
        CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assignments' AND policyname = 'Teachers can manage assignments') THEN
        CREATE POLICY "Teachers can manage assignments" ON public.assignments FOR ALL USING (
            class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
        );
    END IF;
END $$;

-- Submissions policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Anyone can view submissions') THEN
        CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Anyone can create submissions') THEN
        CREATE POLICY "Anyone can create submissions" ON public.submissions FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'submissions' AND policyname = 'Anyone can update submissions') THEN
        CREATE POLICY "Anyone can update submissions" ON public.submissions FOR UPDATE USING (true);
    END IF;
END $$;

-- Achievement unlocks policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievement_unlocks' AND policyname = 'Anyone can view achievement unlocks') THEN
        CREATE POLICY "Anyone can view achievement unlocks" ON public.achievement_unlocks FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievement_unlocks' AND policyname = 'Anyone can create achievement unlocks') THEN
        CREATE POLICY "Anyone can create achievement unlocks" ON public.achievement_unlocks FOR INSERT WITH CHECK (true);
    END IF;
END $$;
