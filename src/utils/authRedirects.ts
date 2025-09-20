interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'school_admin' | 'teacher' | 'student';
  school_id?: string;
  is_active: boolean;
}

export const getRedirectPath = (userProfile: UserProfile | null): string | null => {
  if (!userProfile) return null;

  switch (userProfile.role) {
    case 'school_admin':
      return userProfile.school_id ? '/schools/admin-dashboard' : '/school-admin/signup';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/role-selection';
  }
};

export const shouldRedirectToRole = (userProfile: UserProfile | null, currentPath: string): boolean => {
  if (!userProfile) return false;
  
  const targetPath = getRedirectPath(userProfile);
  
  // Don't redirect if already on target path or certain exception paths
  const exceptionPaths = ['/debug-profile', '/profile', '/'];
  
  return targetPath && 
         targetPath !== currentPath && 
         !exceptionPaths.includes(currentPath);
};