import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { School, Shield, Mail, UserPlus, CheckCircle } from 'lucide-react';

const SchoolAdminSignup = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const { toast } = useToast();
  const { user, createUserProfile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, check profile and create if needed
    if (user && !showSchoolForm) {
      checkAndCreateProfile();
    }
  }, [user, showSchoolForm]);

  const checkAndCreateProfile = async () => {
    if (!user) return;
    
    console.log('checkAndCreateProfile: Checking profile for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('checkAndCreateProfile: Profile query result:', { data, error });

      if (error && error.code === 'PGRST116') {
        // No profile found, create one automatically
        console.log('checkAndCreateProfile: No profile found, creating one...');
        await createUserProfile(
          user.email || '',
          user.user_metadata?.name || user.user_metadata?.full_name || 'School Administrator',
          'school_admin'
        );
        
        // After creating profile, show school form
        setShowSchoolForm(true);
      } else if (data) {
        // Profile exists, redirect to appropriate dashboard
        console.log('checkAndCreateProfile: Profile found, redirecting to dashboard');
        if (data.role === 'school_admin') {
          navigate('/schools/admin-dashboard');
        } else {
          navigate('/role-selection');
        }
      }
    } catch (error) {
      console.error('Error checking/creating user profile:', error);
      // If profile creation fails, still show school form
      setShowSchoolForm(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
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
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    
    console.log('handleSchoolRegistration: Starting registration for user:', user.id);
    console.log('handleSchoolRegistration: User metadata:', user.user_metadata);
    
    setLoading(true);
    try {
      // Create school
      console.log('handleSchoolRegistration: Creating school...');
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: name.trim(),
          address: address || null,
          city: city || null,
          state: stateRegion || null,
          country: country || null,
        })
        .select()
        .single();

      if (schoolError) {
        console.error('handleSchoolRegistration: School creation error:', schoolError);
        throw schoolError;
      }

      console.log('handleSchoolRegistration: School created successfully:', schoolData);

      // Create school admin profile
      console.log('handleSchoolRegistration: Creating user profile...');
      const { error: profileError } = await createUserProfile(
        user.email || '',
        user.user_metadata?.full_name || user.user_metadata?.name || 'School Administrator',
        'school_admin',
        schoolData.id
      );

      if (profileError) {
        console.error('handleSchoolRegistration: Profile creation error:', profileError);
        throw profileError;
      }

      console.log('handleSchoolRegistration: Profile created successfully');

      toast({ 
        title: 'School registered successfully!', 
        description: `Welcome to ${schoolData.name} as the school administrator` 
      });
      
      navigate('/schools/admin-dashboard');
    } catch (err: any) {
      console.error('handleSchoolRegistration: Registration failed:', err);
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to register school', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // If user is authenticated and we need to show school form
  if (user && showSchoolForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <School className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete School Registration</CardTitle>
            <CardDescription>
              Welcome {user.user_metadata?.name || user.email}! Please complete your school registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchoolRegistration} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">School Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Green Valley School" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Street, Area" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is not authenticated, show sign-in options
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">School Administrator Access</CardTitle>
          <CardDescription>
            Only school administrators can create accounts. Please sign in with your Google account to register your school.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Secure Google Authentication</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">What you can do as a School Administrator:</p>
              <ul className="text-left space-y-1">
                <li className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  <span>Register and manage your school</span>
                </li>
                <li className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Invite teachers to join</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Access admin dashboard</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminSignup;
