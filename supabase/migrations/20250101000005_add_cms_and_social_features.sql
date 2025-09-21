-- Content Management System Tables
-- Create content table for educational materials
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('lesson', 'resource', 'announcement', 'video', 'document', 'link')),
  content_data JSONB DEFAULT '{}',
  file_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content categories for organization
CREATE TABLE public.content_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content-category relationships
CREATE TABLE public.content_category_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.content_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_id, category_id)
);

-- Social Features Tables
-- Create discussions/forums
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discussion_type TEXT NOT NULL CHECK (discussion_type IN ('general', 'assignment', 'project', 'announcement')),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discussion posts/comments
CREATE TABLE public.discussion_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('teacher', 'student')),
  content TEXT NOT NULL,
  parent_post_id UUID REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collaboration groups
CREATE TABLE public.collaboration_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL CHECK (group_type IN ('study', 'project', 'discussion', 'peer_review')),
  max_members INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group memberships
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.collaboration_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('member', 'leader', 'moderator')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- Create group activities/tasks
CREATE TABLE public.group_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.collaboration_groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('task', 'discussion', 'review', 'presentation')),
  due_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create peer review system
CREATE TABLE public.peer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, reviewer_id, reviewee_id)
);

-- Create notifications system
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'student')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('discussion', 'assignment', 'group', 'review', 'announcement')),
  related_id UUID, -- Can reference various tables
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content
CREATE POLICY "Teachers can manage content in their classes" 
ON public.content 
FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view published content in their class" 
ON public.content 
FOR SELECT 
USING (
  is_published = TRUE AND
  class_id IN (
    SELECT s.class_id FROM public.students s WHERE s.id IN (
      SELECT id FROM public.students WHERE class_id = class_id
    )
  )
);

-- RLS Policies for content categories
CREATE POLICY "Teachers can manage categories in their classes" 
ON public.content_categories 
FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view categories in their class" 
ON public.content_categories 
FOR SELECT 
USING (
  class_id IN (
    SELECT s.class_id FROM public.students s WHERE s.id IN (
      SELECT id FROM public.students WHERE class_id = class_id
    )
  )
);

-- RLS Policies for discussions
CREATE POLICY "Teachers can manage discussions in their classes" 
ON public.discussions 
FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view discussions in their class" 
ON public.discussions 
FOR SELECT 
USING (
  class_id IN (
    SELECT s.class_id FROM public.students s WHERE s.id IN (
      SELECT id FROM public.students WHERE class_id = class_id
    )
  )
);

-- RLS Policies for discussion posts
CREATE POLICY "Teachers can manage posts in their class discussions" 
ON public.discussion_posts 
FOR ALL 
USING (
  discussion_id IN (
    SELECT d.id FROM public.discussions d 
    JOIN public.classes c ON d.class_id = c.id 
    WHERE c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can manage their own posts" 
ON public.discussion_posts 
FOR ALL 
USING (
  author_id = auth.uid() AND author_type = 'student' AND
  discussion_id IN (
    SELECT d.id FROM public.discussions d 
    JOIN public.classes c ON d.class_id = c.id 
    JOIN public.students s ON s.class_id = c.id 
    WHERE s.id IN (SELECT id FROM public.students WHERE class_id = d.class_id)
  )
);

-- RLS Policies for collaboration groups
CREATE POLICY "Teachers can manage groups in their classes" 
ON public.collaboration_groups 
FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public.classes WHERE teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view groups in their class" 
ON public.collaboration_groups 
FOR SELECT 
USING (
  class_id IN (
    SELECT s.class_id FROM public.students s WHERE s.id IN (
      SELECT id FROM public.students WHERE class_id = class_id
    )
  )
);

-- RLS Policies for group memberships
CREATE POLICY "Students can manage their own memberships" 
ON public.group_memberships 
FOR ALL 
USING (
  student_id IN (
    SELECT s.id FROM public.students s 
    WHERE s.id IN (SELECT id FROM public.students WHERE class_id = (
      SELECT c.id FROM public.collaboration_groups cg 
      JOIN public.classes c ON cg.class_id = c.id 
      WHERE cg.id = group_id
    ))
  )
);

-- RLS Policies for group activities
CREATE POLICY "Group members can manage activities" 
ON public.group_activities 
FOR ALL 
USING (
  group_id IN (
    SELECT gm.group_id FROM public.group_memberships gm 
    JOIN public.students s ON gm.student_id = s.id 
    WHERE s.id IN (SELECT id FROM public.students WHERE class_id = (
      SELECT cg.class_id FROM public.collaboration_groups cg WHERE cg.id = group_id
    ))
  ) OR
  group_id IN (
    SELECT cg.id FROM public.collaboration_groups cg 
    JOIN public.classes c ON cg.class_id = c.id 
    WHERE c.teacher_id = auth.uid()
  )
);

-- RLS Policies for peer reviews
CREATE POLICY "Students can manage their own reviews" 
ON public.peer_reviews 
FOR ALL 
USING (
  reviewer_id IN (
    SELECT s.id FROM public.students s 
    WHERE s.id IN (SELECT id FROM public.students WHERE class_id = (
      SELECT a.class_id FROM public.assignments a WHERE a.id = assignment_id
    ))
  )
);

-- RLS Policies for notifications
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications 
FOR ALL 
USING (user_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussion_posts_updated_at
  BEFORE UPDATE ON public.discussion_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_groups_updated_at
  BEFORE UPDATE ON public.collaboration_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_activities_updated_at
  BEFORE UPDATE ON public.group_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peer_reviews_updated_at
  BEFORE UPDATE ON public.peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
