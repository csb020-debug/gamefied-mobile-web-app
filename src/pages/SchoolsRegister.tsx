import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { School, MapPin, Building2, Globe } from 'lucide-react';

const SchoolsRegister = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('India');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();
  const { user, signInWithGoogle, signInWithEmail, createSchoolAndAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is signed in via Google, show the school creation form
    if (user && user.app_metadata?.provider === 'google') {
      setShowSchoolForm(true);
      setFullName(user.user_metadata?.full_name || '');
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('Initiating Google Sign-In...');
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google Sign-In Error:', error);
        
        // Check if it's a provider not enabled error
        if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
          toast({
            title: 'Google Sign-In Not Available',
            description: 'Google OAuth is not configured for local development. Please use email sign-in instead.',
            variant: 'destructive'
          });
          // Automatically show email form
          setShowEmailForm(true);
        } else {
          toast({
            title: 'Sign-in failed',
            description: error.message || 'Google sign-in is not configured for local development',
            variant: 'destructive'
          });
        }
      } else {
        console.log('Google Sign-In initiated successfully');
      }
      // User will be redirected back and useEffect will handle showing the form
    } catch (error: any) {
      console.error('Google Sign-In Exception:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate Google sign-in',
        variant: 'destructive'
      });
      // Automatically show email form as fallback
      setShowEmailForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Initiating Email Sign-In...');
      const { error } = await signInWithEmail(email.trim());
      if (error) {
        console.error('Email Sign-In Error:', error);
        toast({
          title: 'Sign-in failed',
          description: error.message || 'Failed to send magic link',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a magic link to sign in',
        });
      }
    } catch (error: any) {
      console.error('Email Sign-In Exception:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate email sign-in',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fullName.trim()) return;

    setLoading(true);
    try {
      const schoolData = {
        name: name.trim(),
        address: address || null,
        city: city || null,
        state: stateRegion || null,
        country: country || null,
      };

      const adminData = {
        fullName: fullName.trim()
      };

      const { error, schoolId } = await createSchoolAndAdmin(schoolData, adminData);

      if (error) throw error;

      toast({
        title: 'School registered successfully!',
        description: `Welcome to ${name} as the school administrator`
      });

      navigate('/schools/admin-dashboard');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to register school',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show school creation form if user is signed in
  if (showSchoolForm && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <School className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Your School</CardTitle>
            <CardDescription>
              Welcome {user.user_metadata?.full_name || user.email}! Let's set up your school.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchoolCreation} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Your Full Name
                </label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="e.g., John Smith" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  School Name
                </label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Green Valley International School" 
                  required 
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  School Location (Optional)
                </h3>
                
                <div className="space-y-2">
                  <Input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Street Address" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="City" 
                  />
                  <Input 
                    value={stateRegion} 
                    onChange={(e) => setStateRegion(e.target.value)} 
                    placeholder="State/Region" 
                  />
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)} 
                      className="pl-10"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading || !name.trim() || !fullName.trim()}
                >
                  {loading ? 'Creating School...' : 'Create School & Continue'}
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show Google Sign-In prompt
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <School className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Register Your School</CardTitle>
          <CardDescription>
            Start your environmental education journey by creating a school account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            
            {/* Development Notice */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 dark:text-blue-400 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Development Mode</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    For local development, use email sign-in. Google OAuth requires production setup.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Sign-In Form - Made Primary */}
            {!showEmailForm ? (
              <Button 
                onClick={() => setShowEmailForm(true)}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                Continue with Email
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSignIn()}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleEmailSignIn}
                    className="flex-1"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </Button>
                  <Button 
                    onClick={() => setShowEmailForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or try</span>
              </div>
            </div>

            {/* Google Sign-In Button - Made Secondary */}
            <Button 
              onClick={handleGoogleSignIn} 
              variant="outline"
              className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google (Production Only)'}
            </Button>

          </div>

          <div className="space-y-3 text-center text-sm text-muted-foreground">
            <p>As a school admin, you'll be able to:</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-center gap-2">
                <School className="h-4 w-4" />
                <span>Invite teachers to your school</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Manage school-wide settings</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>View school analytics</span>
              </div>
            </div>
            
            {showEmailForm && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  💡 <strong>Tip:</strong> Check your magic link at <a href="http://127.0.0.1:54324" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Inbucket (localhost:54324)</a> for development
                </p>
              </div>
            )}
          </div>

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

export default SchoolsRegister;