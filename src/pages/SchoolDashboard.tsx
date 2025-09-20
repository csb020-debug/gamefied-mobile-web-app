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
  Trash2
} from 'lucide-react';

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

const SchoolDashboard = () => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [invitations, setInvitations] = useState<TeacherInvitation[]>([]);
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
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
      // For now, we'll get the first school the user is associated with
      // In a real app, you'd have a proper school admin relationship
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .limit(1);

      if (schoolsError) throw schoolsError;

      if (schools && schools.length > 0) {
        const school = schools[0];
        setSchoolInfo(school);

        // Load invitations for this school
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('teacher_invitations')
          .select('*')
          .eq('school_id', school.id)
          .order('created_at', { ascending: false });

        if (invitationsError) throw invitationsError;
        setInvitations((invitationsData || []) as TeacherInvitation[]);
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

      if ((data as any).success) {
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
            description: `Invitation created but email sending failed: ${(emailResult as any).error}`,
            variant: "destructive",
          });
        }
        
        setNewTeacherEmail('');
        loadSchoolData(); // Reload invitations
      } else {
        toast({
          title: "Error",
          description: (data as any).error || 'Failed to send invitation',
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
            <CardTitle>No School Found</CardTitle>
            <CardDescription>
              You need to register a school first to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/school-admin/signup')} className="w-full">
              Register School
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <School className="h-8 w-8" />
              {schoolInfo.name}
            </h1>
            <p className="text-muted-foreground">
              {schoolInfo.city && schoolInfo.state && `${schoolInfo.city}, ${schoolInfo.state}`}
              {schoolInfo.country && `, ${schoolInfo.country}`}
            </p>
          </div>
          <Button onClick={() => navigate('/teacher/dashboard')} variant="outline">
            Teacher Dashboard
          </Button>
        </div>

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
              <Users className="h-5 w-5" />
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
    </div>
  );
};

export default SchoolDashboard;
