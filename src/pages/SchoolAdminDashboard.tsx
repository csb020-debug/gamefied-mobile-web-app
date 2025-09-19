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

const SchoolAdminDashboard = () => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [admins, setAdmins] = useState<SchoolAdmin[]>([]);
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
      // Get user's school admin information
      const { data: adminData, error: adminError } = await supabase
        .from('school_admins')
        .select('school_id, schools(*)')
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;

      if (adminData) {
        const school = adminData.schools;
        setSchoolInfo(school);

        // Load invitations for this school
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('teacher_invitations')
          .select('*')
          .eq('school_id', school.id)
          .order('created_at', { ascending: false });

        if (invitationsError) throw invitationsError;
        setInvitations(invitationsData || []);

        // Load teachers for this school
        const { data: teachersData, error: teachersError } = await supabase
          .rpc('get_school_teachers', { school_id_param: school.id });

        if (teachersError) throw teachersError;
        setTeachers(teachersData || []);

        // Load admins for this school
        const { data: adminsData, error: adminsError } = await supabase
          .rpc('get_school_admins', { school_id_param: school.id });

        if (adminsError) throw adminsError;
        setAdmins(adminsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
      const { data, error } = await supabase.rpc('send_teacher_invitation', {
        school_id_param: schoolInfo.id,
        teacher_email_param: newTeacherEmail.trim(),
        invited_by_param: user?.id
      });

      if (error) throw error;

      if (data.success) {
        // Send email notification
        const invitationLink = `${window.location.origin}/teachers/invite/${data.invitation_token}`;
        const emailResult = await sendTeacherInvitationEmail({
          teacherEmail: newTeacherEmail.trim(),
          schoolName: schoolInfo.name,
          invitationLink,
          expiresAt: data.expires_at,
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
          description: data.error || 'Failed to send invitation',
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
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
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
      const { data, error } = await supabase.rpc('update_teacher_status', {
        teacher_id_param: teacherId,
        is_active_param: isActive
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Teacher status updated",
          description: `Teacher has been ${isActive ? 'activated' : 'deactivated'}`,
        });
        loadSchoolData();
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to update teacher status',
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
          <div className="grid md:grid-cols-3 gap-6">
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">School Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admins.length}</div>
                <p className="text-xs text-muted-foreground">
                  Including you
                </p>
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
