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
  const [schoolDetailsCollected, setSchoolDetailsCollected] = useState(false);
  const [pendingSchoolData, setPendingSchoolData] = useState(null);
  const { toast } = useToast();
  const { user, createUserProfile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, check profile and redirect appropriately
    if (user && !showSchoolForm) {
      checkAndCreateProfile();
    }
  }, [user, showSchoolForm]);

  const checkAndCreateProfile = async () => {
    if (!user) return;
    
    try {
      console.log('SchoolAdminSignup: Checking profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('SchoolAdminSignup: Profile check result:', { data, error });

      if (error && error.code === 'PGRST116') {
        // No profile found, create a basic school admin profile first
        console.log('SchoolAdminSignup: No profile found, creating basic profile');
        
        const { error: profileError } = await createUserProfile(
          user.email || '',
          user.user_metadata?.full_name || user.user_metadata?.name || 'School Administrator',
          'school_admin'
        );
        
        if (profileError) {
          console.error('SchoolAdminSignup: Failed to create basic profile:', profileError);
        } else {
          console.log('SchoolAdminSignup: Basic profile created, showing school form');
        }
        
        // Show school form to complete registration
        setShowSchoolForm(true);
      } else if (data) {
        // Profile exists, check if it has a school association
        console.log('SchoolAdminSignup: Profile exists with role:', data.role, 'school_id:', data.school_id);
        
        if (data.role === 'school_admin') {
          if (data.school_id) {
            // Complete profile with school, redirect to dashboard
            console.log('SchoolAdminSignup: Redirecting to admin dashboard');
            navigate('/schools/admin-dashboard');
          } else {
            // Profile exists but no school associated, show school form
            console.log('SchoolAdminSignup: School admin without school, showing form');
            setShowSchoolForm(true);
          }
        } else {
          // User has a different role, redirect to role selection
          console.log('SchoolAdminSignup: User has different role, redirecting to role selection');
          navigate('/role-selection');
        }
      }
    } catch (error) {
      console.error('SchoolAdminSignup: Error checking user profile:', error);
      // If there's an error, try to create a basic profile and show school form
      const { error: profileError } = await createUserProfile(
        user.email || '',
        user.user_metadata?.full_name || user.user_metadata?.name || 'School Administrator',
        'school_admin'
      );
      
      if (!profileError) {
        console.log('SchoolAdminSignup: Created basic profile after error');
      }
      
      setShowSchoolForm(true);
    }
  };

  const handleSchoolDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "School name required",
        description: "Please enter your school name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Store school details temporarily
    const schoolData = {
      name: name.trim(),
      address: address || null,
      city: city || null,
      state: stateRegion || null,
      country: country || null,
    };
    
    setPendingSchoolData(schoolData);
    setSchoolDetailsCollected(true);
    
    console.log('School details collected:', schoolData);
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
    if (!user || !pendingSchoolData) return;
    
    setLoading(true);
    try {
      console.log('handleSchoolRegistration: Creating school with pending data:', pendingSchoolData);
      
      // Create school with the previously collected data
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert(pendingSchoolData)
        .select()
        .single();

      if (schoolError) {
        console.error('handleSchoolRegistration: School creation error:', schoolError);
        throw schoolError;
      }

      console.log('handleSchoolRegistration: School created:', schoolData);

      // Check if profile exists and update it, or create new one
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('handleSchoolRegistration: Existing profile check:', { existingProfile, profileCheckError });
      
      if (existingProfile && !profileCheckError) {
        // Update existing profile with school association
        console.log('handleSchoolRegistration: Updating existing profile');
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            school_id: schoolData.id,
            role: 'school_admin', // Ensure role is set correctly
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || existingProfile.full_name || 'School Administrator'
          })
          .eq('user_id', user.id);
          
        if (updateError) {
          console.error('handleSchoolRegistration: Profile update error:', updateError);
          throw updateError;
        }
        
        console.log('handleSchoolRegistration: Profile updated successfully');
      } else {
        // Create new profile with school association
        console.log('handleSchoolRegistration: Creating new profile');
        
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
      }
      
      // Create school admin entry
      console.log('handleSchoolRegistration: Creating school admin entry');
      
      const { error: adminError } = await supabase
        .from('school_admins')
        .upsert({
          user_id: user.id,
          school_id: schoolData.id,
          permissions: {}
        }, {
          onConflict: 'user_id,school_id'
        });
        
      if (adminError) {
        console.error('handleSchoolRegistration: School admin creation error:', adminError);
        // Don't throw error here, just log it as it's not critical
        console.warn('Failed to create school admin entry, but continuing...');
      } else {
        console.log('handleSchoolRegistration: School admin entry created successfully');
      }
      
      toast({ 
        title: 'School registered successfully!', 
        description: `Welcome to ${schoolData.name} as the school administrator` 
      });
      
      setTimeout(() => {
        navigate('/schools/admin-dashboard');
      }, 1000);
      
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

  // If no user and school details not collected yet, show school details form first
  if (!user && !schoolDetailsCollected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <School className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">School Registration</CardTitle>
            <CardDescription>
              Let's start by getting some basic information about your school.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchoolDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">School Name *</label>
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
              <Button type="submit" className="w-full" disabled={!name.trim()}>
                Continue to Authentication
              </Button>
            </form>
            
            <div className="mt-6 text-center">
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
  }

  // If school details collected but no user, show authentication step
  if (!user && schoolDetailsCollected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Authenticate Your Account</CardTitle>
            <CardDescription>
              Great! Now let's create your administrator account for {pendingSchoolData?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">School Information Collected</h3>
              <div className="text-sm text-blue-700">
                <p><strong>School:</strong> {pendingSchoolData?.name}</p>
                {pendingSchoolData?.city && (
                  <p><strong>Location:</strong> {pendingSchoolData.city}{pendingSchoolData.state ? `, ${pendingSchoolData.state}` : ''}</p>
                )}
              </div>
            </div>
            
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
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSchoolDetailsCollected(false);
                  setPendingSchoolData(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ← Edit School Information
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated and we need to show school form
  if (user && showSchoolForm && pendingSchoolData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <School className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete School Registration</CardTitle>
            <CardDescription>
              Welcome {user.user_metadata?.name || user.email}! Let's finalize your school registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-800 mb-2">Ready to Create</h3>
              <div className="text-sm text-green-700">
                <p><strong>School:</strong> {pendingSchoolData.name}</p>
                {pendingSchoolData.city && (
                  <p><strong>Location:</strong> {pendingSchoolData.city}{pendingSchoolData.state ? `, ${pendingSchoolData.state}` : ''}</p>
                )}
                <p><strong>Administrator:</strong> {user.user_metadata?.name || user.email}</p>
              </div>
            </div>
            
            <form onSubmit={handleSchoolRegistration} className="space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating School Account...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SchoolAdminSignup;