import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { sendTeacherInvitationEmail } from '@/lib/emailService';
import { 
  School, 
  Users, 
  Mail, 
  Plus, 
  UserCheck, 
  UserX, 
  Clock,
  Copy,
  Trash2,
  Edit,
  Settings,
  BarChart3,
  UserPlus,
  Shield,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeacherInvitation {
  id: string;
  teacher_email: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  invitation_token: string;
}

interface SchoolInfo {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface Teacher {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

interface SchoolAdmin {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

interface Student {
  id: string;
  nickname: string;
  class_id: string;
  created_at: string;
  classes: {
    name: string;
    grade: string;
    teacher_id: string;
  };
  submissions: {
    score: number;
    completed: boolean;
  }[];
}

interface Class {
  id: string;
  name: string;
  grade: string;
  teacher_id: string;
  created_at: string;
  students: Student[];
  teachers: {
    full_name: string;
    email: string;
  };
}

const SchoolAdminDashboard = () => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [admins, setAdmins] = useState<SchoolAdmin[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadSchoolData();
    }
  }, [user]);

  const loadSchoolData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get user's profile to check their role and school
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Unable to load user profile. Please try again.');
      }

      if (!userProfile || userProfile.role !== 'school_admin' || !userProfile.school_id) {
        console.error('User is not a school admin or has no school assigned');
        throw new Error('You do not have school admin access.');
      }

      // Get school information
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', userProfile.school_id)
        .single();

      if (schoolError) {
        console.error('Error fetching school:', schoolError);
        throw new Error('Unable to load school information.');
      }

      setSchoolInfo(school);

      // Load invitations for this school
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('teacher_invitations')
        .select('*')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

      if (invitationsError && invitationsError.code !== 'PGRST116') {
        console.error('Error fetching invitations:', invitationsError);
      }
      setInvitations((invitationsData || []) as TeacherInvitation[]);

      // Load teachers for this school from user_profiles
      const { data: teachersData, error: teachersError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('school_id', school.id)
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });

      if (teachersError && teachersError.code !== 'PGRST116') {
        console.error('Error fetching teachers:', teachersError);
      }
      
      // Map user_profiles to teacher format
      const mappedTeachers = (teachersData || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        is_active: profile.is_active,
        created_at: profile.created_at
      }));
      setTeachers(mappedTeachers);

      // Load admins for this school from user_profiles
      const { data: adminsData, error: adminsError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('school_id', school.id)
        .eq('role', 'school_admin')
        .order('created_at', { ascending: false });

      if (adminsError && adminsError.code !== 'PGRST116') {
        console.error('Error fetching admins:', adminsError);
      }
      
      // Map user_profiles to admin format
      const mappedAdmins = (adminsData || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at
      }));
      setAdmins(mappedAdmins);

      // Load classes for this school
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          grade,
          teacher_id,
          created_at,
          students (
            id,
            nickname,
            created_at,
            submissions (score, completed)
          ),
          teachers:user_profiles!classes_teacher_id_fkey (
            full_name,
            email
          )
        `)
        .eq('school_id', school.id);

      if (classesError && classesError.code !== 'PGRST116') {
        console.error('Error fetching classes:', classesError);
      }
      setClasses((classesData || []) as any[]);

      // Flatten students from all classes
      const allStudents = classesData?.flatMap(cls => 
        cls.students?.map((student: any) => ({
          ...student,
          classes: {
            name: cls.name,
            grade: cls.grade,
            teacher_id: cls.teacher_id
          }
        })) || []
      ) || [];
      setStudents(allStudents);
    } catch (error: any) {
      console.error('Error in loadSchoolData:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load school data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherEmail.trim() || !schoolInfo) return;

    setInviteLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('send_teacher_invitation', {
        school_id_param: schoolInfo.id,
        teacher_email_param: newTeacherEmail.trim(),
        invited_by_param: user?.id
      });

      if (error) throw error;

      if ((data as any)?.success) {
        // Send email notification
        const invitationLink = `${window.location.origin}/teachers/invite/${(data as any).invitation_token}`;
        const emailResult = await sendTeacherInvitationEmail({
          teacherEmail: newTeacherEmail.trim(),
          schoolName: schoolInfo.name,
          invitationLink,
          expiresAt: (data as any).expires_at,
          invitedBy: user?.email || 'School Administrator'
        });

        if (emailResult.success) {
          toast({
            title: "Invitation sent!",
            description: `Invitation sent to ${newTeacherEmail}`,
          });
        } else {
          toast({
            title: "Invitation created but email failed",
            description: `Invitation created but email sending failed: ${emailResult.error}`,
            variant: "destructive",
          });
        }
        
        setNewTeacherEmail('');
        loadSchoolData(); // Reload invitations
      } else {
        toast({
          title: "Error",
          description: (data as any)?.error || 'Failed to send invitation',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !schoolInfo) return;

    try {
      // First, create a user profile for the admin
      const { data: profileData, error: profileError } = await (supabase as any).rpc('create_user_profile', {
        user_id_param: user?.id, // This should be the new admin's user ID
        email_param: newAdminEmail.trim(),
        role_param: 'school_admin',
        school_id_param: schoolInfo.id
      });

      if (profileError) throw profileError;

      toast({
        title: "Admin added!",
        description: `${newAdminEmail} has been added as a school admin`,
      });

      setNewAdminEmail('');
      loadSchoolData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTeacherStatus = async (teacherId: string, isActive: boolean) => {
    try {
      const { data, error } = await (supabase as any).rpc('update_teacher_status', {
        teacher_id_param: teacherId,
        is_active_param: isActive
      });

      if (error) throw error;

      if ((data as any)?.success) {
        toast({
          title: "Teacher status updated",
          description: `Teacher has been ${isActive ? 'activated' : 'deactivated'}`,
        });
        loadSchoolData();
      } else {
        toast({
          title: "Error",
          description: (data as any)?.error || 'Failed to update teacher status',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/teachers/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Invitation link copied to clipboard",
    });
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });
      loadSchoolData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600"><UserCheck className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600 border-red-600"><UserX className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><UserX className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading school data...</p>
        </div>
      </div>
    );
  }

  if (!schoolInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <School className="h-12 w-12 mx-auto text-muted-foreground" />
            <CardTitle>No School Admin Access</CardTitle>
            <CardDescription>
              You don't have admin access to any school. Contact your school administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              School Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              {schoolInfo.name} • {schoolInfo.city && schoolInfo.state && `${schoolInfo.city}, ${schoolInfo.state}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/teacher/dashboard')} variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Teacher View
            </Button>
            <Button onClick={() => navigate('/schools/dashboard')} variant="outline">
              <School className="h-4 w-4 mr-2" />
              School Dashboard
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2 inline" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teachers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="h-4 w-4 mr-2 inline" />
              Teachers ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invitations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="h-4 w-4 mr-2 inline" />
              Invitations ({invitations.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'classes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4 mr-2 inline" />
              Classes ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="h-4 w-4 mr-2 inline" />
              Admins ({admins.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {classes.length} classes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teachers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {teachers.filter(t => t.is_active).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active classes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {invitations.filter(i => i.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invitations.filter(i => i.status === 'accepted').length} accepted
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>School Overview</CardTitle>
                <CardDescription>Key metrics and recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Top Performing Classes</h4>
                    <div className="space-y-2">
                      {classes.slice(0, 3).map((cls, index) => {
                        const totalPoints = cls.students?.reduce((sum, student) => 
                          sum + (student.submissions?.reduce((s, sub) => s + (sub.score || 0), 0) || 0), 0
                        ) || 0;
                        return (
                          <div key={cls.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="font-medium">{cls.name}</span>
                              <div className="text-sm text-muted-foreground">
                                Grade {cls.grade} • {cls.students?.length || 0} students
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{totalPoints}</div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">School Admins</h4>
                    <div className="space-y-2">
                      {admins.slice(0, 3).map((admin) => (
                        <div key={admin.id} className="flex items-center gap-3 p-2 border rounded">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{admin.full_name || admin.email}</span>
                            <div className="text-sm text-muted-foreground">
                              {admin.user_id === user?.id ? 'You' : 'Admin'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Manage Teachers
                </CardTitle>
                <CardDescription>
                  View and manage all teachers in your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No teachers found</p>
                    <p className="text-sm">Invite teachers to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{teacher.full_name || teacher.email}</span>
                              <div className="text-sm text-muted-foreground">
                                {teacher.email}
                              </div>
                            </div>
                            <Badge variant={teacher.is_active ? "default" : "secondary"}>
                              {teacher.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Joined: {new Date(teacher.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateTeacherStatus(teacher.id, !teacher.is_active)}
                          >
                            {teacher.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="space-y-6">
            {/* Invite Teachers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Invite Teachers
                </CardTitle>
                <CardDescription>
                  Send email invitations to teachers to join your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendInvitation} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" disabled={inviteLoading}>
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Teacher Invitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Teacher Invitations
                </CardTitle>
                <CardDescription>
                  Manage teacher invitations and track their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invitations sent yet</p>
                    <p className="text-sm">Invite teachers to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invitation.teacher_email}</span>
                            {getStatusBadge(invitation.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Sent: {new Date(invitation.created_at).toLocaleDateString()}
                            {invitation.accepted_at && (
                              <span> • Accepted: {new Date(invitation.accepted_at).toLocaleDateString()}</span>
                            )}
                            {invitation.status === 'pending' && (
                              <span> • Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {invitation.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyInvitationLink(invitation.invitation_token)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Link
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelInvitation(invitation.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Students
                </CardTitle>
                <CardDescription>
                  View all students across all classes in your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No students found</p>
                    <p className="text-sm">Students will appear here once they join classes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => {
                      const totalPoints = student.submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;
                      const completedChallenges = student.submissions?.filter(sub => sub.completed).length || 0;
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{student.nickname}</span>
                                <div className="text-sm text-muted-foreground">
                                  Class: {student.classes?.name} (Grade {student.classes?.grade})
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Joined: {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{totalPoints}</div>
                            <div className="text-xs text-muted-foreground">points</div>
                            <div className="text-xs text-muted-foreground">{completedChallenges} challenges</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  All Classes
                </CardTitle>
                <CardDescription>
                  View all classes and their performance in your school
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No classes found</p>
                    <p className="text-sm">Classes will appear here once teachers create them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classes.map((cls) => {
                      const totalPoints = cls.students?.reduce((sum, student) => 
                        sum + (student.submissions?.reduce((s, sub) => s + (sub.score || 0), 0) || 0), 0
                      ) || 0;
                      const avgPoints = cls.students?.length ? Math.round(totalPoints / cls.students.length) : 0;
                      return (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{cls.name}</span>
                                <div className="text-sm text-muted-foreground">
                                  Grade {cls.grade} • Teacher: {cls.teachers?.full_name || 'Unknown'}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Created: {new Date(cls.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{cls.students?.length || 0}</div>
                            <div className="text-xs text-muted-foreground">students</div>
                            <div className="text-xs text-muted-foreground">{avgPoints} avg points</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  School Administrators
                </CardTitle>
                <CardDescription>
                  Manage school administrators and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {admins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No administrators found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{admin.full_name || admin.email}</span>
                              <div className="text-sm text-muted-foreground">
                                {admin.email}
                              </div>
                            </div>
                            {admin.user_id === user?.id && (
                              <Badge variant="default">You</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Added: {new Date(admin.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Permissions
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
