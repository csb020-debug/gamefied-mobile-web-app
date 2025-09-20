import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, GraduationCap, BookOpen, Shield, Users } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: string) => {
    switch (role) {
      case 'school_admin':
        navigate('/school-admin/signup');
        break;
      case 'teacher':
        navigate('/teachers/signup');
        break;
      case 'student':
        navigate('/students/join');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to EcoQuest!</h1>
          <p className="text-muted-foreground">
            Please select your role to get started with the gamified learning platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* School Admin */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleRoleSelection('school_admin')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">School Administrator</CardTitle>
              <CardDescription>
                Manage your school, invite teachers, and oversee the learning platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Register and manage your school
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Invite and manage teachers
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Access admin dashboard
                </li>
              </ul>
              <Button className="w-full mt-4" onClick={() => handleRoleSelection('school_admin')}>
                Register as School Admin
              </Button>
            </CardContent>
          </Card>

          {/* Teacher */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleRoleSelection('teacher')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Teacher</CardTitle>
              <CardDescription>
                Create classes, manage students, and track learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Create and manage classes
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Assign challenges and games
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Track student progress
                </li>
              </ul>
              <Button className="w-full mt-4" variant="outline" onClick={() => handleRoleSelection('teacher')}>
                Join as Teacher
              </Button>
            </CardContent>
          </Card>

          {/* Student */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleRoleSelection('student')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Student</CardTitle>
              <CardDescription>
                Join a class, play games, and earn achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Join classes with class codes
                </li>
                <li className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Play educational games
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Compete with classmates
                </li>
              </ul>
              <Button className="w-full mt-4" variant="outline" onClick={() => handleRoleSelection('student')}>
                Join as Student
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
