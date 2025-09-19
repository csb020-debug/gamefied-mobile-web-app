-- Create achievement_unlocks table
CREATE TABLE public.achievement_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievement_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own achievement unlocks" 
ON public.achievement_unlocks 
FOR SELECT 
USING (true);

CREATE POLICY "Students can create their own achievement unlocks" 
ON public.achievement_unlocks 
FOR INSERT 
WITH CHECK (true);

-- Teachers can view achievement unlocks for their students
CREATE POLICY "Teachers can view achievement unlocks for their students" 
ON public.achievement_unlocks 
FOR SELECT 
USING (
  student_id IN (
    SELECT s.id FROM public.students s 
    JOIN public.classes c ON s.class_id = c.id 
    WHERE c.teacher_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_achievement_unlocks_updated_at
  BEFORE UPDATE ON public.achievement_unlocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
