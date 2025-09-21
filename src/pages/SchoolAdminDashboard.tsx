import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  School, 
  Users, 
  GraduationCap, 
  UserPlus, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SchoolInfo {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;  
  country?: string;
}

interface TeacherInvitation {
  id: string;
  teacher_email: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'expired';
  created_at: string;
  expires_at: string;
}

const SchoolAdminDashboard = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (user && userProfile?.role === 'school_admin') {
      loadSchoolData();
    }
  }, [user, userProfile]);

  const loadSchoolData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get school admin data with school info  
      const { data: schoolAdminData, error: schoolAdminError } = await supabase
        .from('school_admins')
        .select(`
          *,
          schools(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (schoolAdminError) throw schoolAdminError;
      
      if (schoolAdminData?.schools) {
        setSchoolInfo(schoolAdminData.schools);

        // Get invitations for this school
        const { data: invitationData, error: invitationError } = await supabase
          .from('teacher_invitations')
          .select('*')
          .eq('school_id', schoolAdminData.schools.id)
          .order('created_at', { ascending: false });

        if (invitationError) throw invitationError;
        
        setInvitations(invitationData?.map(inv => ({
          ...inv,
          status: inv.status as 'pending' | 'accepted' | 'cancelled' | 'expired'
        })) || []);

        // Get teachers for this school
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('*')
          .eq('school_id', schoolAdminData.schools.id);

        if (teachersError) throw teachersError;
        setTeachers(teachersData || []);
      }
    } catch (error: any) {
      console.error('Error loading school data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load school data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user || !schoolInfo) return;

    setInviteLoading(true);
    try {
      const { data, error } = await supabase.rpc('send_teacher_invitation', {
        school_id_param: schoolInfo.id,
        teacher_email_param: inviteEmail.trim(),  
        invited_by_param: user.id
      });

      if (error) throw error;

      if ((data as any)?.success) {
        toast({
          title: 'Invitation sent!',
          description: `Teacher invitation sent to ${inviteEmail}`
        });
        setInviteEmail('');
        loadSchoolData(); // Refresh data
      } else {
        toast({
          title: 'Error',
          description: (data as any)?.error || 'Failed to send invitation',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive'
      });
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading school dashboard...</p>
        </div>
      </div>
    );
  }

  if (!schoolInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No School Found</CardTitle>
            <CardDescription>
              Unable to find school information for your account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <School className="h-8 w-8 text-primary" />
              {schoolInfo.name}
            </h1>
            <p className="text-muted-foreground mt-1">School Administration Dashboard</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invitations.filter(inv => inv.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School Location</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {schoolInfo.city && schoolInfo.state 
                  ? `${schoolInfo.city}, ${schoolInfo.state}`
                  : schoolInfo.country || 'Not specified'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Teacher */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Teacher
            </CardTitle>
            <CardDescription>
              Send an invitation to a teacher to join your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteTeacher} className="flex gap-3">
              <Input
                type="email"
                placeholder="teacher@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
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
            <CardTitle>Teacher Invitations</CardTitle>
            <CardDescription>Manage pending and sent invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No invitations sent yet
                </p>
              ) : (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invitation.teacher_email}</p>
                      <p className="text-sm text-muted-foreground">
                        Sent {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Pending</span>
                        </>
                      )}
                      {invitation.status === 'accepted' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Accepted</span>
                        </>
                      )}
                      {invitation.status === 'expired' && (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">Expired</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers</CardTitle>
            <CardDescription>Teachers in your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teachers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No teachers added yet
                </p>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{teacher.full_name || teacher.email}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary">Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;