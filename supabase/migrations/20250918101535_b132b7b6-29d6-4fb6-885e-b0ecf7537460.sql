-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tables and policies already exist, skipping creation

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