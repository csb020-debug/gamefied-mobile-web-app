import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  School, 
  GraduationCap, 
  Shield,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserNavigation = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user || !userProfile) {
    return (
      <Button onClick={() => navigate('/teachers/signup')} variant="outline">
        Sign In
      </Button>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'school_admin':
        return <Shield className="h-4 w-4" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4" />;
      case 'student':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'school_admin':
        return 'School Admin';
      case 'teacher':
        return 'Teacher';
      case 'student':
        return 'Student';
      default:
        return 'User';
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getNavigationItems = () => {
    const items = [];

    if (userProfile.role === 'school_admin') {
      items.push(
        <DropdownMenuItem key="admin-dashboard" onClick={() => navigate('/schools/admin-dashboard')}>
          <Shield className="h-4 w-4 mr-2" />
          Admin Dashboard
        </DropdownMenuItem>
      );
    }

    if (userProfile.role === 'teacher' || userProfile.role === 'school_admin') {
      items.push(
        <DropdownMenuItem key="teacher-dashboard" onClick={() => navigate('/teacher/dashboard')}>
          <GraduationCap className="h-4 w-4 mr-2" />
          Teacher Dashboard
        </DropdownMenuItem>
      );
    }

    if (userProfile.role === 'school_admin') {
      items.push(
        <DropdownMenuItem key="school-dashboard" onClick={() => navigate('/schools/dashboard')}>
          <School className="h-4 w-4 mr-2" />
          School Dashboard
        </DropdownMenuItem>
      );
    }

    return items;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {getRoleIcon(userProfile.role)}
          <span className="hidden sm:inline">{userProfile.full_name || user.email}</span>
          <span className="sm:hidden">{getRoleName(userProfile.role)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {getRoleName(userProfile.role)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {getNavigationItems()}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNavigation;
