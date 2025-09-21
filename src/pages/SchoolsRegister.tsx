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
  const [loading, setLoading] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const { toast } = useToast();
  const { user, signInWithGoogle, createSchoolAndAdmin } = useAuth();
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
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: 'Sign-in failed',
          description: error.message,
          variant: 'destructive'
        });
      }
      // User will be redirected back and useEffect will handle showing the form
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
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
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">School Admin Access</span>
              </div>
            </div>
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