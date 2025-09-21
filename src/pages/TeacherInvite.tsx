import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  School, 
  CheckCircle, 
  XCircle, 
  Clock,
  UserPlus,
  Mail
} from 'lucide-react';

interface InvitationData {
  school_name: string;
  school_id: string;
  expires_at: string;
  status: string;
}

const TeacherInvite = () => {
  const { token } = useParams<{ token: string }>();
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signInWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadInvitationData();
    }
  }, [token]);

  const loadInvitationData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teacher_invitations')
        .select(`
          *,
          schools (
            name,
            id
          )
        `)
        .eq('invitation_token', token)
        .single();

      if (error) throw error;

      if (data) {
        setInvitationData({
          school_name: data.schools.name,
          school_id: data.schools.id,
          expires_at: data.expires_at,
          status: data.status
        });
      } else {
        setError('Invitation not found');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!token || !user || !invitationData) return;

    setAccepting(true);
    try {
      // First accept the invitation
      const { data, error } = await supabase.rpc('accept_teacher_invitation', {
        invitation_token_param: token
      });

      if (error) throw error;

      if (data.success) {
        // Create teacher profile with school association using direct insert
        const { error: profileError } = await supabase
          .from('teachers')
          .insert({
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            school_id: invitationData.school_id
          });

        if (profileError) {
          console.error('Error creating teacher profile:', profileError);
          // Don't fail the whole process, just log the error
        }

        toast({
          title: "Invitation accepted!",
          description: `You've successfully joined ${data.school_name}`,
        });
        navigate('/teacher/dashboard');
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to accept invitation',
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
      setAccepting(false);
    }
  };

  const handleSignIn = async () => {
    if (!invitationData) return;

    // Store the invitation token for after sign-in
    localStorage.setItem('pending_invitation', token || '');
    navigate('/teachers/signup');
  };

  const handleGoogleSignIn = async () => {
    if (!invitationData) return;

    // Store the invitation token for after sign-in
    localStorage.setItem('pending_invitation', token || '');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Error",
          description: error.message,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>
              {error || 'This invitation link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitationData.expires_at) < new Date();
  const isAccepted = invitationData.status === 'accepted';
  const isCancelled = invitationData.status === 'cancelled';

  if (isExpired || isCancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              {isExpired ? 'Invitation Expired' : 'Invitation Cancelled'}
            </CardTitle>
            <CardDescription>
              {isExpired 
                ? 'This invitation has expired. Please contact the school administrator for a new invitation.'
                : 'This invitation has been cancelled by the school administrator.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Already Accepted</CardTitle>
            <CardDescription>
              You have already accepted this invitation to join {invitationData.school_name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/teacher/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <School className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Teacher Invitation</CardTitle>
          <CardDescription>
            You've been invited to join {invitationData.school_name} as a teacher
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
            <School className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-lg">{invitationData.school_name}</h3>
            <p className="text-sm text-muted-foreground">
              Expires: {new Date(invitationData.expires_at).toLocaleDateString()}
            </p>
          </div>

          {user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Welcome back, {user.email}! Click below to accept this invitation.
              </p>
              <Button 
                onClick={acceptInvitation} 
                className="w-full" 
                disabled={accepting}
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                You need to sign in to accept this invitation.
              </p>
              
              <Button onClick={handleGoogleSignIn} className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button onClick={handleSignIn} variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Use Magic Link
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherInvite;
