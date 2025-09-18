-- Fix function search paths for security
ALTER FUNCTION public.generate_class_code() SET search_path = public;
ALTER FUNCTION public.set_class_code() SET search_path = public;