import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, School, Users, UserCheck, UserPlus } from 'lucide-react';

const TeacherSignup = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pendingInvitation, setPendingInvitation] = useState<string | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const { signInWithEmail, user, createUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for pending invitation
    const invitationToken = localStorage.getItem('pending_invitation');
    if (invitationToken) {
      setPendingInvitation(invitationToken);
    }
  }, []);

  useEffect(() => {
    // If user is signed in and there's a pending invitation, accept it
    if (user && pendingInvitation) {
      acceptPendingInvitation();
    }
    
    // If user is signed in and no profile exists, show profile form
    if (user && !showProfileForm) {
      checkUserProfile();
    }
  }, [user, pendingInvitation]);

  const checkUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile found, show profile form
        setShowProfileForm(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
    }
  };

  const acceptPendingInvitation = async () => {
    if (!pendingInvitation || !user) return;

    try {
      const { data, error } = await supabase.rpc('accept_teacher_invitation', {
        invitation_token_param: pendingInvitation
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Invitation accepted!",
          description: `You've successfully joined ${data.school_name}`,
        });
        localStorage.removeItem('pending_invitation');
        setPendingInvitation(null);
        navigate('/teacher/dashboard');
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to accept invitation',
          variant: "destructive",
        });
        localStorage.removeItem('pending_invitation');
        setPendingInvitation(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      localStorage.removeItem('pending_invitation');
      setPendingInvitation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await signInWithEmail(email);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email for the sign-in link.",
      });
    }
    setLoading(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await createUserProfile(
        user.email || '',
        fullName.trim(),
        'teacher'
      );

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile created!",
          description: "Welcome to the platform!",
        });
        setShowProfileForm(false);
        navigate('/teacher/dashboard');
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

  if (showProfileForm && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please provide your full name to complete your teacher account setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground/80">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g., John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading || !fullName.trim()}>
                {loading ? 'Creating profile...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a magic link to {email}. Click the link to sign in to your teacher account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setEmailSent(false)}
            >
              Try different email
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
          <CardTitle className="text-2xl">Teacher Sign Up</CardTitle>
          <CardDescription>
            {pendingInvitation 
              ? "You have a pending invitation. Sign in to accept it."
              : "Create your teacher account to manage classes and track student progress"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvitation && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Pending Invitation</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You have a pending school invitation. Sign in to accept it.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending magic link...' : 'Send Magic Link'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Manage Classes</span>
              </div>
              <div className="flex items-center space-x-2">
                <School className="h-4 w-4" />
                <span>Track Progress</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
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

export default TeacherSignup;