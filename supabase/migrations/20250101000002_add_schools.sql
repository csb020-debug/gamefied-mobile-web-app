-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add school_id to classes (optional)
ALTER TABLE public.classes ADD CONSTRAINT fk_classes_school_id FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;

-- RLS for schools (authenticated users can read)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'Allow read for authenticated'
  ) THEN
    CREATE POLICY "Allow read for authenticated"
    ON public.schools
    FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- update_updated_at trigger for schools
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_schools_updated_at'
  ) THEN
    CREATE TRIGGER update_schools_updated_at
      BEFORE UPDATE ON public.schools
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

