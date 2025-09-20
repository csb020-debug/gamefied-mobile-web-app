-- Add teacher invitations table and related functions
-- This migration creates the missing teacher_invitations table and functions

-- Create teacher invitations table
CREATE TABLE IF NOT EXISTS public.teacher_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_email TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on teacher_invitations
ALTER TABLE public.teacher_invitations ENABLE ROW LEVEL SECURITY;

-- Create function to generate invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  LOOP
    token := encode(gen_random_bytes(24), 'base64');
    -- Remove URL-unsafe characters
    token := regexp_replace(token, '[^A-Za-z0-9_-]', '', 'g');
    -- Ensure it's a reasonable length
    IF length(token) >= 32 THEN
      token := substring(token from 1 for 32);
      -- Check if token already exists
      IF NOT EXISTS (SELECT 1 FROM public.teacher_invitations WHERE invitation_token = token) THEN
        RETURN token;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to set invitation token
CREATE OR REPLACE FUNCTION public.set_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_token IS NULL OR NEW.invitation_token = '' THEN
    NEW.invitation_token := public.generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set invitation token
CREATE TRIGGER set_invitation_token_trigger
  BEFORE INSERT ON public.teacher_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invitation_token();

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_teacher_invitations_updated_at
  BEFORE UPDATE ON public.teacher_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to send teacher invitation
CREATE OR REPLACE FUNCTION public.send_teacher_invitation(
  school_id_param UUID,
  teacher_email_param TEXT,
  invited_by_param UUID
)
RETURNS JSON AS $$
DECLARE
  invitation_id UUID;
  invitation_token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Check if invitation already exists and is pending
  IF EXISTS (
    SELECT 1 FROM public.teacher_invitations 
    WHERE school_id = school_id_param 
      AND teacher_email = teacher_email_param 
      AND status = 'pending'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Invitation already sent to this email');
  END IF;
  
  -- Create invitation
  INSERT INTO public.teacher_invitations (school_id, invited_by, teacher_email)
  VALUES (school_id_param, invited_by_param, teacher_email_param)
  RETURNING id, invitation_token, expires_at INTO invitation_id, invitation_token, expires_at;
  
  RETURN json_build_object(
    'success', true,
    'invitation_id', invitation_id,
    'invitation_token', invitation_token,
    'expires_at', expires_at
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to accept teacher invitation
CREATE OR REPLACE FUNCTION public.accept_teacher_invitation(
  invitation_token_param TEXT
)
RETURNS JSON AS $$
DECLARE
  invitation_record RECORD;
  result JSON;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record 
  FROM public.teacher_invitations 
  WHERE invitation_token = invitation_token_param 
    AND status = 'pending' 
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Update the invitation status
  UPDATE public.teacher_invitations 
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;
  
  -- Return success with school info
  SELECT json_build_object(
    'success', true,
    'school_id', invitation_record.school_id,
    'school_name', s.name
  )
  INTO result
  FROM public.schools s
  WHERE s.id = invitation_record.school_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for teacher_invitations
CREATE POLICY "School admins can manage invitations for their school" 
ON public.teacher_invitations 
FOR ALL 
USING (
  school_id IN (
    SELECT school_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'school_admin'
  )
);

CREATE POLICY "Anyone can view invitations by token" 
ON public.teacher_invitations 
FOR SELECT 
USING (invitation_token IS NOT NULL);

CREATE POLICY "Teachers can view their own invitations" 
ON public.teacher_invitations 
FOR SELECT 
USING (teacher_email = auth.email());

-- Add helpful comments
COMMENT ON TABLE public.teacher_invitations IS 'Manages teacher invitations with tokens and status tracking';
COMMENT ON FUNCTION public.send_teacher_invitation IS 'Creates a new teacher invitation and returns invitation details';
COMMENT ON FUNCTION public.accept_teacher_invitation IS 'Accepts a teacher invitation using the token';