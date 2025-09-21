-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Classes table will be created in 20250101000001_add_core_tables.sql

-- Students table will be created in 20250101000001_add_core_tables.sql

-- Assignments table will be created in 20250101000001_add_core_tables.sql

-- Submissions table will be created in 20250101000001_add_core_tables.sql

-- Tables and RLS policies will be created in 20250101000001_add_core_tables.sql

-- Class-related functions and triggers will be created in 20250101000001_add_core_tables.sql