export const getMenuItems = (userRole?: string, isLoggedIn: boolean = false) => {
  const baseItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'Leaderboard', ariaLabel: 'View rankings', link: '/leaderboard' }
  ];

  // Add login/logout based on authentication status
  if (isLoggedIn) {
    baseItems.push({ label: 'Logout', ariaLabel: 'Sign out of your account', link: '/logout' });
  } else {
    baseItems.push({ label: 'Login', ariaLabel: 'Sign in to your account', link: '/teachers/signup' });
  }

  switch (userRole) {
    case 'student':
      return [
        ...baseItems,
        { label: 'Learn', ariaLabel: 'Access learning modules', link: '/learn' },
        { label: 'Games', ariaLabel: 'Play educational games', link: '/games' },
        { label: 'Challenges', ariaLabel: 'Take on eco challenges', link: '/challenges' },
        { label: 'Profile', ariaLabel: 'Manage your profile', link: '/profile' }
      ];
    
    case 'teacher':
      return [
        ...baseItems,
        { label: 'Dashboard', ariaLabel: 'Teacher dashboard', link: '/teacher/dashboard' },
        { label: 'Challenges', ariaLabel: 'Manage challenges', link: '/challenges' },
        { label: 'Profile', ariaLabel: 'Manage your profile', link: '/profile' }
      ];
    
    case 'school_admin':
      return [
        ...baseItems,
        { label: 'Admin Dashboard', ariaLabel: 'School admin dashboard', link: '/schools/admin-dashboard' },
        { label: 'Teacher Dashboard', ariaLabel: 'Teacher view', link: '/teacher/dashboard' },
        { label: 'School Dashboard', ariaLabel: 'School dashboard', link: '/schools/dashboard' }
      ];
    
    default:
      return baseItems;
  }
};

// Keep the old export for backward compatibility
export const menuItems = getMenuItems();

export const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];