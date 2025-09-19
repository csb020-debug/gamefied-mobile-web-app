# School Admin Role and Permissions System

This document outlines the school admin role and permissions system that has been added to the gamified mobile web app.

## Overview

The system now includes a comprehensive role-based access control system with three main user types:
- **School Admin**: Full administrative control over their school
- **Teacher**: Can manage classes and students within their school
- **Student**: Can participate in classes and complete assignments

## Database Schema Changes

### New Tables

1. **user_profiles**: Stores user role and profile information
2. **school_admins**: Tracks school administrators and their permissions
3. **teachers**: Manages teacher information and school associations

### Key Features

- **Role-based access control** with proper RLS policies
- **School admin dashboard** for managing teachers and invitations
- **Teacher management** with activate/deactivate capabilities
- **Invitation system** for inviting teachers to schools
- **Profile creation** during signup and invitation acceptance

## New Pages and Components

### Pages

1. **SchoolAdminDashboard** (`/schools/admin-dashboard`)
   - Overview of school statistics
   - Teacher management (view, activate/deactivate)
   - Invitation management (send, track, cancel)
   - Admin management

2. **Updated SchoolsRegister** (`/schools/register`)
   - Now creates school admin profile during registration
   - Requires authentication before registration

3. **Updated TeacherSignup** (`/teachers/signup`)
   - Creates teacher profile after authentication
   - Handles profile completion for new users

4. **Updated TeacherInvite** (`/teachers/invite/:token`)
   - Creates teacher profile with school association when accepting invitations

### Components

1. **RoleProtectedRoute**: Route protection based on user roles
2. **UserNavigation**: Dynamic navigation based on user role
3. **Updated AuthProvider**: Enhanced with user profile management

## Authentication Flow

### School Admin Registration
1. User signs in via magic link
2. Navigates to school registration
3. Fills out school and personal information
4. System creates school and school admin profile
5. Redirects to school admin dashboard

### Teacher Signup
1. User signs in via magic link
2. System checks for existing profile
3. If no profile exists, shows profile completion form
4. Creates teacher profile
5. Redirects to teacher dashboard

### Teacher Invitation
1. School admin sends invitation via email
2. Teacher clicks invitation link
3. If not signed in, redirects to signup
4. After signup, accepts invitation
5. System creates teacher profile with school association
6. Redirects to teacher dashboard

## Permissions System

### School Admin Permissions
- View and manage all teachers in their school
- Send teacher invitations
- Activate/deactivate teacher accounts
- View school statistics and analytics
- Manage school information
- Access to both admin and teacher dashboards

### Teacher Permissions
- Create and manage classes
- View and manage students in their classes
- Create assignments and content
- Access teacher dashboard
- Limited to their school (if associated with one)

### Student Permissions
- Join classes via class codes
- Complete assignments
- View their progress and achievements
- Access student dashboard

## API Functions

### Database Functions

1. **create_user_profile**: Creates user profile with role and school association
2. **get_user_role**: Retrieves user's role
3. **is_school_admin**: Checks if user is admin of specific school
4. **get_school_admins**: Lists all admins for a school
5. **get_school_teachers**: Lists all teachers for a school
6. **update_teacher_status**: Activates/deactivates teacher accounts

## Security Features

### Row Level Security (RLS)
- Users can only access data they're authorized to see
- School admins can only manage their own school
- Teachers can only access their own classes and students
- Proper isolation between different schools

### Role-based Route Protection
- Routes are protected based on user roles
- Automatic redirection for unauthorized access
- Graceful handling of missing profiles

## Usage Examples

### Creating a School Admin
```typescript
// After user signs in
const { error } = await createUserProfile(
  user.email,
  'John Smith',
  'school_admin',
  schoolId
);
```

### Checking User Role
```typescript
const { userProfile } = useAuth();
if (userProfile?.role === 'school_admin') {
  // Show admin features
}
```

### Protecting Routes
```tsx
<Route 
  path="/schools/admin-dashboard" 
  element={
    <RoleProtectedRoute allowedRoles={['school_admin']}>
      <SchoolAdminDashboard />
    </RoleProtectedRoute>
  } 
/>
```

## Migration Instructions

1. Run the database migration: `20250101000003_add_user_profiles_and_roles.sql`
2. Update your Supabase types if using TypeScript
3. Deploy the new pages and components
4. Test the authentication flow

## Testing Checklist

- [ ] School admin can register and access admin dashboard
- [ ] School admin can invite teachers
- [ ] Teachers can accept invitations and access teacher dashboard
- [ ] Role-based route protection works correctly
- [ ] RLS policies prevent unauthorized access
- [ ] User navigation shows correct options based on role
- [ ] Profile creation works during signup and invitation acceptance

## Future Enhancements

- [ ] Bulk teacher management
- [ ] Advanced permission settings for school admins
- [ ] Teacher role hierarchy (head teacher, department head, etc.)
- [ ] Audit logging for admin actions
- [ ] Email notifications for admin actions
- [ ] School analytics and reporting
- [ ] Multi-school support for super admins
