-- Tables already exist, skipping creation

-- Enable RLS on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policies are created in other migrations to avoid conflicts

-- Create function to generate unique class codes
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate class codes
CREATE OR REPLACE FUNCTION public.set_class_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.class_code IS NULL OR NEW.class_code = '' THEN
    NEW.class_code := public.generate_class_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers already exist, skipping creation