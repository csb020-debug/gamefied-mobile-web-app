# Gamified Mobile Web App - Testing Checklist

## Database Migrations Applied ✅

The following database migrations have been successfully applied:

1. **Core Tables** (20250918101429, 20250918101535, 20250918101618)
   - `classes` - Teacher classes with auto-generated codes
   - `students` - Student profiles linked to classes
   - `assignments` - Game/challenge/quiz assignments
   - `submissions` - Student assignment submissions

2. **Achievement System** (20250101000000)
   - `achievement_unlocks` - Student achievement tracking

3. **Content Management System** (20250101000001)
   - `content` - Educational materials (lessons, videos, documents, etc.)
   - `content_categories` - Content organization
   - `content_category_assignments` - Content-category relationships

4. **Social Features** (20250101000001)
   - `discussions` - Class discussion forums
   - `discussion_posts` - Discussion comments and replies
   - `collaboration_groups` - Student study/project groups
   - `group_memberships` - Group member management
   - `group_activities` - Group tasks and activities
   - `peer_reviews` - Peer review system for assignments
   - `notifications` - User notification system

5. **School Management** (20250918110000)
   - `schools` - School information
   - Added `school_id` to classes table

## Environment Setup Required

Before testing, ensure you have:

1. **Supabase Project Configuration**
   - Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. **Supabase Authentication**
   - Enable Email (magic link) authentication in Supabase Dashboard
   - Configure any additional auth providers if needed

## Testing Checklist

### For School Administrators

#### 1. School Registration & Setup
- [ ] **Register a school**
  - Navigate to `/schools/register`
  - Enter school name, address, city, state, country
  - Submit registration form
  - Verify redirect to school dashboard
  - Verify school information is displayed correctly

#### 2. Teacher Invitation Management
- [ ] **Invite teachers via email**
  - In school dashboard, enter teacher email address
  - Click "Send Invitation"
  - Verify invitation is created and email is sent (check console logs)
  - Verify invitation appears in invitations list with "Pending" status

- [ ] **Manage invitations**
  - View all sent invitations with status indicators
  - Copy invitation links for manual sharing
  - Cancel pending invitations
  - Monitor invitation expiration dates

- [ ] **Track invitation status**
  - Verify status changes from "Pending" to "Accepted" when teacher accepts
  - Test expired invitation handling
  - Test cancelled invitation handling

### For Teachers

#### 1. Authentication & Account Setup
- [ ] **Accept school invitation**
  - Receive invitation email with link
  - Click invitation link (`/teachers/invite/:token`)
  - Verify invitation page loads with school information
  - Sign in with email address
  - Verify automatic invitation acceptance
  - Verify redirect to teacher dashboard with school association

- [ ] **Sign up as a teacher (without invitation)**
  - Navigate to `/teachers/signup`
  - Enter email address
  - Check email for magic link
  - Click magic link to complete signup
  - Verify redirect to teacher dashboard

- [ ] **Login as a teacher**
  - Navigate to `/teachers/signup`
  - Enter email address
  - Check email for magic link
  - Click magic link to login
  - Verify redirect to teacher dashboard

#### 2. Class Management
- [ ] **Create a new class**
  - Click "Create Class" or similar button
  - Enter class name (e.g., "Math 101")
  - Enter grade level (e.g., "Grade 5")
  - Verify school is pre-selected (if teacher is associated with school)
  - Submit form
  - Verify class is created successfully
  - Verify class code is auto-generated (6 characters)
  - Verify class is associated with correct school

- [ ] **Get class code**
  - View the generated class code
  - Copy the class code for student testing
  - Verify code format (6 alphanumeric characters)

- [ ] **Manage class settings**
  - Edit class name/grade
  - View class statistics
  - Delete class (if needed)

#### 3. Content Management System

- [ ] **Create different types of content**
  - **Lesson Content**
    - Create a lesson with title, description
    - Add lesson content in content_data JSONB field
    - Set content_type to 'lesson'
    - Save as draft (is_published = false)
  
  - **Video Content**
    - Create video content
    - Upload or link video file
    - Set content_type to 'video'
    - Add video metadata in content_data
  
  - **Document Content**
    - Create document content
    - Upload PDF/document file
    - Set content_type to 'document'
    - Add document metadata
  
  - **Resource Content**
    - Create resource content
    - Set content_type to 'resource'
    - Add resource links or files
  
  - **Announcement Content**
    - Create announcement
    - Set content_type to 'announcement'
    - Set as published for immediate visibility

- [ ] **Organize content with categories**
  - Create content categories
    - Set category name and description
    - Choose category color
    - Save category
  - Assign content to categories
    - Select content items
    - Assign to appropriate categories
    - Verify category assignments

- [ ] **Publish/unpublish content**
  - Toggle content publication status
  - Verify published content is visible to students
  - Verify unpublished content is hidden from students
  - Test bulk publish/unpublish actions

#### 4. Social Features

- [ ] **Create discussion topics**
  - Create general discussion
    - Set title and description
    - Set discussion_type to 'general'
    - Pin important discussions
  - Create assignment discussion
    - Link to specific assignment
    - Set discussion_type to 'assignment'
  - Create project discussion
    - Set discussion_type to 'project'
    - Add project details
  - Create announcement discussion
    - Set discussion_type to 'announcement'
    - Pin for visibility

- [ ] **Set up collaboration groups**
  - Create study groups
    - Set group_type to 'study'
    - Set max_members limit
    - Add group description
  - Create project groups
    - Set group_type to 'project'
    - Assign project tasks
  - Create discussion groups
    - Set group_type to 'discussion'
    - Focus on specific topics
  - Create peer review groups
    - Set group_type to 'peer_review'
    - Configure review settings

- [ ] **Enable peer reviews for assignments**
  - Create assignment with peer review enabled
  - Configure review settings
    - Set review criteria
    - Set review deadlines
    - Configure anonymous/anonymous reviews
  - Assign reviewers to students
  - Monitor review progress

### For Students

#### 1. Class Joining
- [ ] **Join a class using the class code**
  - Navigate to `/join` or `/join/{class_code}`
  - Enter the class code provided by teacher
  - Enter student nickname
  - Submit join request
  - Verify successful class joining
  - Verify redirect to student dashboard

#### 2. Student Features

- [ ] **Browse content library**
  - View published content
    - Filter by content type (lesson, video, document, etc.)
    - Filter by category
    - Search content by title/description
  - Access different content types
    - View lesson content
    - Watch video content
    - Download document content
    - Access resource links
  - Verify unpublished content is not visible

- [ ] **Participate in discussions**
  - View discussion topics
    - See all discussions in class
    - Filter by discussion type
    - View pinned discussions first
  - Create discussion posts
    - Reply to existing discussions
    - Create new discussion threads
    - Edit own posts
    - Delete own posts
  - Interact with posts
    - Like/react to posts
    - Reply to specific posts
    - Quote other posts

- [ ] **Join collaboration groups**
  - View available groups
    - See group descriptions and types
    - Check group member limits
    - View current members
  - Join groups
    - Request to join groups
    - Accept group invitations
    - Leave groups if needed
  - Participate in group activities
    - View group tasks
    - Complete group assignments
    - Collaborate on projects

- [ ] **Submit peer reviews**
  - View assigned peer reviews
    - See review assignments
    - Check review deadlines
    - View review criteria
  - Complete peer reviews
    - Rate peer submissions (1-5 stars)
    - Write review comments
    - Submit reviews
  - View received reviews
    - See feedback from peers
    - View ratings and comments
    - Respond to reviews

## Database Schema Verification

### Core Tables
- [ ] Verify `classes` table has proper RLS policies
- [ ] Verify `students` table has proper RLS policies
- [ ] Verify `assignments` table has proper RLS policies
- [ ] Verify `submissions` table has proper RLS policies

### Content Management
- [ ] Verify `content` table has proper RLS policies
- [ ] Verify `content_categories` table has proper RLS policies
- [ ] Verify `content_category_assignments` table has proper RLS policies

### Social Features
- [ ] Verify `discussions` table has proper RLS policies
- [ ] Verify `discussion_posts` table has proper RLS policies
- [ ] Verify `collaboration_groups` table has proper RLS policies
- [ ] Verify `group_memberships` table has proper RLS policies
- [ ] Verify `group_activities` table has proper RLS policies
- [ ] Verify `peer_reviews` table has proper RLS policies
- [ ] Verify `notifications` table has proper RLS policies

### Achievement System
- [ ] Verify `achievement_unlocks` table has proper RLS policies

### School Management
- [ ] Verify `schools` table has proper RLS policies

## Security Testing

### Row Level Security (RLS)
- [ ] Test that teachers can only access their own classes
- [ ] Test that students can only access their class content
- [ ] Test that users cannot access other users' data
- [ ] Test that anonymous users cannot access protected data

### Authentication
- [ ] Test magic link authentication flow
- [ ] Test session persistence
- [ ] Test logout functionality
- [ ] Test token refresh

## Performance Testing

- [ ] Test with multiple concurrent users
- [ ] Test with large amounts of content
- [ ] Test with many discussion posts
- [ ] Test with large file uploads

## Mobile Responsiveness

- [ ] Test on mobile devices
- [ ] Test on tablets
- [ ] Test touch interactions
- [ ] Test responsive design

## Error Handling

- [ ] Test invalid class codes
- [ ] Test network connectivity issues
- [ ] Test invalid file uploads
- [ ] Test form validation
- [ ] Test error messages display

## Browser Compatibility

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge

## Notes

- All database migrations have been successfully applied
- TypeScript types have been regenerated to match the current schema
- RLS policies are in place for all tables
- The application is ready for comprehensive testing

## Next Steps

1. Set up environment variables for Supabase
2. Configure authentication in Supabase Dashboard
3. Start with teacher authentication and class creation
4. Test content management features
5. Test social features and collaboration
6. Test student features and peer reviews
7. Perform security and performance testing
